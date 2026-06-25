import { prisma } from "@/lib/prisma"
import QuizClient from "./QuizClient"

type ExercicioMC = {
  id: number
  pergunta: string
  opcoes: string[]
  resposta: string
  explicacao: string
}

type ConjugacoesTipo = {
  prasens: Record<string, string>
  prateritum: Record<string, string>
  perfekt: string
}

export default async function QuizPage() {
  const [palavras, verbos, modulos] = await Promise.all([
    prisma.word.findMany({ orderBy: { id: "asc" } }),
    prisma.verb.findMany({ orderBy: { id: "asc" } }),
    prisma.grammarModule.findMany(),
  ])

  // Extrair apenas exercícios de escolha-múltipla para o quiz
  const exerciciosMC: ExercicioMC[] = modulos.flatMap(m => {
    const exs = JSON.parse(m.exercicios) as Array<{
      id: number
      tipo: string
      pergunta: string
      opcoes?: string[]
      resposta: string
      explicacao: string
    }>
    return exs
      .filter(e => e.tipo === "escolha-multipla" && e.opcoes)
      .map(e => ({
        id: e.id + m.id * 100, // id único global
        pergunta: e.pergunta,
        opcoes: e.opcoes!,
        resposta: e.resposta,
        explicacao: e.explicacao,
      }))
  })

  const dadosPalavras = palavras.map(p => ({
    id: p.id,
    alemao: p.alemao,
    artigo: p.artigo,
    genero: p.genero,
    raiz: p.raiz,
    traducaoPt: p.traducaoPt,
    exemplo: p.exemplo,
    tema: p.tema,
  }))

  const dadosVerbos = verbos.map(v => ({
    id: v.id,
    infinitivo: v.infinitivo,
    traducaoPt: v.traducaoPt,
    raiz: v.raiz,
    irregular: v.irregular,
    conjugacoes: JSON.parse(v.conjugacoes) as ConjugacoesTipo,
  }))

  return (
    <QuizClient
      palavras={dadosPalavras}
      verbos={dadosVerbos}
      exerciciosMC={exerciciosMC}
    />
  )
}
