import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore } from '@/lib/data-store';

export async function GET() {
  const services = (await readStore()).services;
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const service = await updateStore((store) => {
      const item = {
        id: createId("service"),
        name: data.name,
        price: Number(data.price),
        priceMax: data.priceMax !== undefined && data.priceMax !== "" ? Number(data.priceMax) : undefined,
        duration: Number(data.duration),
        category: data.category || "Hair",
        description: data.description || "",
        image: data.imageUrl || data.image || "",
        materials: [],
      };
      store.services.push(item);
      return item;
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
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

    const service = await updateStore((store) => {
      const item = store.services.find((service) => service.id === data.id);
      if (!item) return null;

      if (data.name !== undefined) item.name = data.name;
      if (data.price !== undefined) item.price = Number(data.price);
      if (data.priceMax !== undefined) item.priceMax = data.priceMax === "" ? undefined : Number(data.priceMax);
      if (data.duration !== undefined) item.duration = Number(data.duration);
      if (data.category !== undefined) item.category = data.category;
      if (data.description !== undefined) item.description = data.description;
      if (data.imageUrl !== undefined || data.image !== undefined) item.image = data.imageUrl ?? data.image;

      return item;
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
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
      store.services = store.services.filter((service) => service.id !== id);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
