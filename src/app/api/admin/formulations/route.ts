import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore } from '@/lib/data-store';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const formulations = (await readStore()).formulations
      .filter((item) => !clientId || item.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(formulations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch formulations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const formulation = await updateStore((store) => {
      const formulation = {
        id: createId("formulation"),
        title: data.title,
        description: data.description,
        clientId: data.clientId || null,
        beforeImage: data.beforeImage || null,
        afterImage: data.afterImage || null,
        createdAt: new Date().toISOString(),
      };
      store.formulations.push(formulation);
      return formulation;
    });
    return NextResponse.json(formulation);
  } catch (error) {
    console.error("[FORMULATION_POST]", error);
    return NextResponse.json({ error: "Failed to create formulation" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const formulation = await updateStore((store) => {
      const formulation = store.formulations.find((entry) => entry.id === data.id);
      if (!formulation) return null;

      if (data.title !== undefined) formulation.title = data.title;
      if (data.description !== undefined) formulation.description = data.description;
      if (data.clientId !== undefined) formulation.clientId = data.clientId || null;
      if (data.beforeImage !== undefined) formulation.beforeImage = data.beforeImage || null;
      if (data.afterImage !== undefined) formulation.afterImage = data.afterImage || null;

      return formulation;
    });

    if (!formulation) return NextResponse.json({ error: "Formulation not found" }, { status: 404 });
    return NextResponse.json(formulation);
  } catch (error) {
    console.error("[FORMULATION_PATCH]", error);
    return NextResponse.json({ error: "Failed to update formulation" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await updateStore((store) => {
      store.formulations = store.formulations.filter((entry) => entry.id !== id);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORMULATION_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete formulation" }, { status: 500 });
  }
}
