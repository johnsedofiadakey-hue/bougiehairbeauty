import { NextResponse } from "next/server";
import { bucket } from "@/lib/firebase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = path.join("/");

    if (!objectPath.startsWith("uploads/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const [contents] = await file.download();

    const body = new Blob([new Uint8Array(contents)]);

    return new NextResponse(body, {
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[MEDIA_GET]", error);
    return NextResponse.json({ error: "Unable to load media" }, { status: 500 });
  }
}
