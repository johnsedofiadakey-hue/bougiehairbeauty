import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { bucket } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `uploads/${uniqueSuffix}-${file.name.replace(/\s+/g, "-")}`;

    const blob = bucket.file(filename);
    
    // Upload the buffer to Firebase Storage
    await blob.save(buffer, {
      contentType: file.type,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    const url = `/api/media/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
