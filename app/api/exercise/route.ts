import { NextRequest, NextResponse } from "next/server";
import { generateExercise } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { level, topic } = await req.json();

    if (!level || !topic) {
      return NextResponse.json(
        { error: "Parâmetros 'level' e 'topic' são obrigatórios." },
        { status: 400 }
      );
    }

    const exercise = await generateExercise(level as string, topic as string);
    return NextResponse.json(exercise);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
