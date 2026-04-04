import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { ChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, profile, filteredPrograms } = body;

    if (!messages || !profile) {
      return NextResponse.json(
        { error: "Mesajlar ve profil gerekli." },
        { status: 400 }
      );
    }

    const reply = await callGemini(messages, profile, filteredPrograms ?? []);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
