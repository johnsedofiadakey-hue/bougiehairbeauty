import { bucket } from "@/lib/firebase-admin";
import { defaultStore } from "@/lib/default-data";

export type Store = {
  settings: typeof defaultStore.settings;
  services: any[];
  inventory: any[];
  users: any[];
  clients: any[];
  staff: any[];
  appointments: any[];
  formulations: any[];
  portfolio: any[];
  pushSubscriptions: any[];
};

const STORE_FILE = "app-state/store.json";

// Client phones may be stored in slightly different formats over time
// (with/without +, spaces, dashes, or the leading 0 vs "44" prefix), so
// matching is done by suffix rather than exact equality.
export function findClientByPhone(store: Store, phoneInput: string) {
  const cleanInput = phoneInput.replace(/[\s\-\+\(\)]/g, "");
  return store.clients.find((c) => {
    if (!c.phone) return false;
    const cleanC = c.phone.replace(/[\s\-\+\(\)]/g, "");
    return cleanC.endsWith(cleanInput) || cleanInput.endsWith(cleanC);
  });
}

// Unlike phone, email has no formatting variance worth normalizing beyond
// case — Firebase email-link sign-in already lowercases/trims before this
// is ever called.
export function findClientByEmail(store: Store, emailInput: string) {
  const clean = emailInput.trim().toLowerCase();
  if (!clean) return undefined;
  return store.clients.find((c) => (c.email || "").trim().toLowerCase() === clean);
}

function cloneDefaultStore(): Store {
  return JSON.parse(JSON.stringify(defaultStore));
}

function mergeWithDefaults(data: Partial<Store> | null | undefined): Store {
  const base = cloneDefaultStore();
  if (!data) return base;

  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...(data.settings || {}) },
    services: Array.isArray(data.services) && data.services.length ? data.services : base.services,
    inventory: Array.isArray(data.inventory) && data.inventory.length ? data.inventory : base.inventory,
    users: Array.isArray(data.users) && data.users.length ? data.users : base.users,
    clients: Array.isArray(data.clients) && data.clients.length ? data.clients : base.clients,
    staff: Array.isArray(data.staff) && data.staff.length ? data.staff : base.staff,
    appointments: Array.isArray(data.appointments) ? data.appointments : base.appointments,
    formulations: Array.isArray(data.formulations) ? data.formulations : base.formulations,
    portfolio: Array.isArray(data.portfolio) ? data.portfolio : base.portfolio,
    pushSubscriptions: Array.isArray(data.pushSubscriptions) ? data.pushSubscriptions : base.pushSubscriptions,
  };
}

export async function readStore(): Promise<Store> {
  try {
    const file = bucket.file(STORE_FILE);
    const [exists] = await file.exists();
    if (!exists) {
      const initial = cloneDefaultStore();
      await writeStore(initial);
      return initial;
    }

    const [contents] = await file.download();
    return mergeWithDefaults(JSON.parse(contents.toString("utf8")));
  } catch (error) {
    console.error("[DATA_STORE_READ]", error);
    return cloneDefaultStore();
  }
}

export async function writeStore(store: Store): Promise<void> {
  await bucket.file(STORE_FILE).save(JSON.stringify(store, null, 2), {
    contentType: "application/json",
    resumable: false,
    metadata: {
      cacheControl: "private, no-store",
    },
  });
}

// Reads the store together with its GCS object generation, so a subsequent
// write can be made conditional on nothing else having written in between.
async function readStoreWithGeneration(): Promise<{ store: Store; generation: number | null }> {
  const file = bucket.file(STORE_FILE);
  const [exists] = await file.exists();
  if (!exists) {
    const initial = cloneDefaultStore();
    try {
      // ifGenerationMatch: 0 succeeds only if the object still doesn't exist,
      // so two concurrent first-writers can't clobber each other.
      await file.save(JSON.stringify(initial, null, 2), {
        contentType: "application/json",
        resumable: false,
        metadata: { cacheControl: "private, no-store" },
        preconditionOpts: { ifGenerationMatch: 0 },
      });
    } catch {
      // Someone else created it first; fall through and read what they wrote.
    }
  }

  const [contents] = await file.download();
  const [metadata] = await file.getMetadata();
  return {
    store: mergeWithDefaults(JSON.parse(contents.toString("utf8"))),
    generation: metadata.generation ? Number(metadata.generation) : null,
  };
}

function isGenerationMismatch(error: any): boolean {
  return error?.code === 412 || /precondition/i.test(error?.message || "");
}

// Read-modify-write with optimistic concurrency: the write only succeeds if
// no other request modified the store since we read it, retrying on conflict.
// This prevents concurrent admin actions from silently losing each other's
// updates (the whole store is a single JSON blob, so naive read-then-write
// is a lost-update race).
export async function updateStore<T>(updater: (store: Store) => T | Promise<T>): Promise<T> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { store, generation } = await readStoreWithGeneration();
    const result = await updater(store);

    try {
      await bucket.file(STORE_FILE).save(JSON.stringify(store, null, 2), {
        contentType: "application/json",
        resumable: false,
        metadata: { cacheControl: "private, no-store" },
        preconditionOpts: generation != null ? { ifGenerationMatch: generation } : undefined,
      });
      return result;
    } catch (error) {
      if (isGenerationMismatch(error) && attempt < MAX_ATTEMPTS) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to update store: too many concurrent write conflicts");
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
