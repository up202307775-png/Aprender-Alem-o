import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk"

type AvaliacaoFala = {
  precisao: number
  sugestoes: string[]
  explicacao: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 503 }
    )
  }

  const body = await req.json().catch(() => null)
  const alvo: string = body?.alvo ?? ""
  const transcricao: string = body?.transcricao ?? ""

  if (!alvo || !transcricao) {
    return NextResponse.json(
      { error: "Parâmetros 'alvo' e 'transcricao' são obrigatórios." },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `És um professor de alemão especializado em pronúncia e fala.
O utilizador tentou dizer uma frase em alemão e o reconhecimento de voz captou a transcrição.
Compara a frase alvo com a transcrição e avalia a pronúncia.
Responde SEMPRE e EXCLUSIVAMENTE com JSON válido, sem markdown, sem blocos de código.
Estrutura obrigatória:
{
  "precisao": <inteiro de 0 a 100>,
  "sugestoes": ["<dica de pronúncia específica em português>", ...],
  "explicacao": "<breve análise geral em português>"
}
Se a transcrição estiver perfeita ou quase perfeita, "sugestoes" pode ser [].`

  const userPrompt = `Frase alvo: "${alvo}"\nTranscrição captada: "${transcricao}"`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : ""

  let avaliacao: AvaliacaoFala
  try {
    avaliacao = JSON.parse(rawText) as AvaliacaoFala
  } catch {
    return NextResponse.json(
      { error: "Resposta inválida do modelo. Tenta de novo." },
      { status: 500 }
    )
  }

  return NextResponse.json(avaliacao)
}
