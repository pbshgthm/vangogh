import { NextResponse, NextRequest } from "next/server";
import { head } from "@vercel/blob";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return new NextResponse("Not configured", { status: 404 });
  }

  const { path: segments } = await context.params;
  if (!Array.isArray(segments) || !segments.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pathname = `desk/${segments.join("/")}`;
  try {
    const metadata = await head(pathname, { token });
    const upstream = await fetch(metadata.downloadUrl);
    if (!upstream.ok) {
      return new NextResponse("Blob fetch failed", { status: upstream.status });
    }
    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
