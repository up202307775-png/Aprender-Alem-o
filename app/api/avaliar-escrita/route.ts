import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk"

const MIN_CHARS = 20
const MAX_CHARS = 1000

type Erro = {
  original: string
  correto: string
  explicacao: string
}

type Avaliacao = {
  erros: Erro[]
  correcao: string
  explicacao: string
  versaoMelhorada: string
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
  const texto: string = body?.texto ?? ""

  if (texto.length < MIN_CHARS) {
    return NextResponse.json(
      { error: `O texto deve ter pelo menos ${MIN_CHARS} caracteres.` },
      { status: 400 }
    )
  }
  if (texto.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `O texto não pode exceder ${MAX_CHARS} caracteres.` },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `És um professor de alemão experiente que avalia textos escritos por aprendentes de nível intermédio (A2-B1).
Responde SEMPRE e EXCLUSIVAMENTE com JSON válido, sem markdown, sem explicações extra, sem blocos de código.
O JSON deve ter exatamente esta estrutura:
{
  "erros": [
    { "original": "<fragmento errado>", "correto": "<forma correta>", "explicacao": "<breve explicação em português>" }
  ],
  "correcao": "<texto completo corrigido>",
  "explicacao": "<análise geral em português: pontos fortes e principais dificuldades do aprendente>",
  "versaoMelhorada": "<versão do texto melhorada, mais natural e rica em vocabulário, mantendo o sentido original>"
}
Se não houver erros, retorna "erros": [].`

  const userPrompt = `Avalia o seguinte texto em alemão:\n\n${texto}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : ""

  let avaliacao: Avaliacao
  try {
    avaliacao = JSON.parse(rawText) as Avaliacao
  } catch {
    return NextResponse.json(
      { error: "Resposta inválida do modelo. Tenta de novo." },
      { status: 500 }
    )
  }

  return NextResponse.json(avaliacao)
}
