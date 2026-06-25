import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { tipoQuiz, pontuacao } = (await req.json()) as {
    tipoQuiz: string
    pontuacao: number
  }

  if (typeof tipoQuiz !== "string" || typeof pontuacao !== "number") {
    return NextResponse.json({ erro: "Parâmetros inválidos" }, { status: 400 })
  }

  const registo = await prisma.score.create({
    data: { tipoQuiz, pontuacao },
  })

  return NextResponse.json({ id: registo.id })
}
