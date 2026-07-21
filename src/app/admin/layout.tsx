import { readStore } from "@/lib/data-store";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = (await readStore()).settings;

  return (
    <AdminLayoutClient settings={settings}>
      {children}
    </AdminLayoutClient>
  );
}
