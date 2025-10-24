import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { imagePaletteFromSource, SearchError } from "@/lib/processing";

export const runtime = "nodejs";

const sampleDir = path.join(
  process.cwd(),
  "public",
  "static",
  "img",
  "sample"
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const type = String(formData.get("type") ?? "");

    if (type === "userfile") {
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json("NOFILE", { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      if (!arrayBuffer.byteLength) {
        return NextResponse.json("NOFILE", { status: 400 });
      }
      const buffer = Buffer.from(arrayBuffer);
      const data = await imagePaletteFromSource(buffer);
      return NextResponse.json({ data });
    }

    if (!type) {
      return NextResponse.json("NOFILE", { status: 400 });
    }

    const safeType = type.replace(/[^a-z0-9]/gi, "");
    const samplePath = path.join(sampleDir, safeType);
    try {
      await fs.access(samplePath);
    } catch {
      throw new SearchError("Sample not found");
    }
    const data = await imagePaletteFromSource(samplePath);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof SearchError) {
      return NextResponse.json("SEARCH_ERROR", { status: 400 });
    }
    console.error("Image API error", error);
    return NextResponse.json("SEARCH_ERROR", { status: 500 });
  }
}
