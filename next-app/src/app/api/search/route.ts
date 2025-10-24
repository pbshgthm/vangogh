import { NextResponse } from "next/server";
import { searchPalettes, SearchError } from "@/lib/processing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = String(body?.key ?? "").trim();
    const paletteSize = Number(body?.paletteSize ?? 4);
    const cacheClear = Boolean(body?.cacheClear);

    if (!key) {
      return NextResponse.json("SEARCH_ERROR", { status: 400 });
    }

    const data = await searchPalettes(key, paletteSize, cacheClear);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof SearchError) {
      return NextResponse.json("SEARCH_ERROR", { status: 400 });
    }
    console.error("Search API error", error);
    return NextResponse.json("SEARCH_ERROR", { status: 500 });
  }
}
