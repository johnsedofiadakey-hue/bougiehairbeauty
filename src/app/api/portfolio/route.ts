import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore } from '@/lib/data-store';

export async function GET() {
  const items = (await readStore()).portfolio.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const item = await updateStore((store) => {
      const item = {
        id: createId("portfolio"),
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrl,
        description: data.description || "",
        createdAt: new Date().toISOString(),
      };
      store.portfolio.push(item);
      return item;
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
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

    const item = await updateStore((store) => {
      const item = store.portfolio.find((entry) => entry.id === data.id);
      if (!item) return null;

      if (data.title !== undefined) item.title = data.title;
      if (data.category !== undefined) item.category = data.category;
      if (data.imageUrl !== undefined) item.imageUrl = data.imageUrl;
      if (data.description !== undefined) item.description = data.description;

      return item;
    });

    if (!item) return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await updateStore((store) => {
      store.portfolio = store.portfolio.filter((item) => item.id !== id);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
