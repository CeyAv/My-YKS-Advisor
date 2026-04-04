import { NextRequest, NextResponse } from "next/server";
import { filterPrograms } from "@/lib/filter";
import { FilterRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: FilterRequest = await req.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        { error: "Öğrenci profili gerekli." },
        { status: 400 }
      );
    }

    const programs = filterPrograms(profile);

    return NextResponse.json({
      programs: programs.slice(0, 100), // Return top 100 for UI display
      totalFound: programs.length,
    });
  } catch (error) {
    console.error("Filter API error:", error);
    return NextResponse.json(
      { error: "Filtreleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
