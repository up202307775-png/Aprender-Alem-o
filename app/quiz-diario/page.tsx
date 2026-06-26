import { prisma } from "@/lib/prisma"
import QuizDiarioClient from "./QuizDiarioClient"

export const dynamic = "force-dynamic"

type ItemQuiz = {
  id: string
  tipo: "word" | "verb"
  pergunta: string
  resposta: string
  artigo: string | null
  nivel: string
}

export default async function QuizDiarioPage() {
  const hoje = new Date()
  const inicioDia = new Date(hoje)
  inicioDia.setHours(0, 0, 0, 0)

  const revisadosHoje = await prisma.reviewState.findMany({
    where: { ultimaRevisao: { gte: inicioDia } },
  })

  const wordIds = revisadosHoje.filter(r => r.itemType === "word").map(r => r.itemId)
  const verbIds = revisadosHoje.filter(r => r.itemType === "verb").map(r => r.itemId)

  const [palavras, verbos] = await Promise.all([
    wordIds.length > 0
      ? prisma.word.findMany({
          where: { id: { in: wordIds } },
          include: { module: { include: { level: true } } },
        })
      : Promise.resolve([]),
    verbIds.length > 0
      ? prisma.verb.findMany({
          where: { id: { in: verbIds } },
          include: { module: { include: { level: true } } },
        })
      : Promise.resolve([]),
  ])

  const itens: ItemQuiz[] = [
    ...palavras.map(p => ({
      id: `word-${p.id}`,
      tipo: "word" as const,
      pergunta: p.traducaoPt,
      resposta: p.alemao,
      artigo: p.artigo ?? null,
      nivel: p.module?.level?.codigo ?? "",
    })),
    ...verbos.map(v => ({
      id: `verb-${v.id}`,
      tipo: "verb" as const,
      pergunta: v.traducaoPt,
      resposta: v.infinitivo,
      artigo: null,
      nivel: v.module?.level?.codigo ?? "",
    })),
  ]

  return <QuizDiarioClient itensIniciais={itens} />
}
