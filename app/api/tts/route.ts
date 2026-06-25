import { NextRequest, NextResponse } from "next/server";

// Lê a chave e voz das variáveis de ambiente — NUNCA chegam ao cliente
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const TTS_VOICE = process.env.TTS_VOICE ?? "onyx"

export async function POST(req: NextRequest) {
  const { texto } = (await req.json()) as { texto: string }

  if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
    return NextResponse.json({ erro: "texto_vazio" }, { status: 400 })
  }

  // Sem chave configurada → sinaliza ao cliente para usar fallback (Web Speech API)
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ erro: "sem_chave" }, { status: 503 })
  }

  const resposta = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: texto.slice(0, 4096), // limite da API
      voice: TTS_VOICE,
      response_format: "mp3",
    }),
  })

  if (!resposta.ok) {
    const erro = await resposta.text()
    console.error("OpenAI TTS falhou:", erro)
    return NextResponse.json({ erro: "falha_tts" }, { status: 502 })
  }

  const audioBuffer = await resposta.arrayBuffer()

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      // Cache durante 24h: o mesmo texto alemão produz sempre o mesmo áudio
      "Cache-Control": "public, max-age=86400",
    },
  })
}
