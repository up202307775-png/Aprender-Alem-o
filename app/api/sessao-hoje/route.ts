import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const userState = await prisma.userState.findUnique({
    where: { id: 1 },
    include: { currentLevel: true },
  })

  if (!userState) {
    return NextResponse.json({ erro: "UserState não encontrado" }, { status: 404 })
  }

  const currentLevelId = userState.currentLevelId
  const nivelCodigo = userState.currentLevel.codigo

  // Todos os words e verbs do nível atual (via módulo)
  const [words, verbs] = await Promise.all([
    prisma.word.findMany({
      where: { module: { levelId: currentLevelId } },
      select: { id: true },
    }),
    prisma.verb.findMany({
      where: { module: { levelId: currentLevelId } },
      select: { id: true },
    }),
  ])

  const wordIds = words.map(w => w.id)
  const verbIds = verbs.map(v => v.id)
  const totalItens = wordIds.length + verbIds.length

  // ReviewStates existentes para estes itens
  const reviewStates = totalItens > 0
    ? await prisma.reviewState.findMany({
        where: {
          OR: [
            { itemType: "word", itemId: { in: wordIds } },
            { itemType: "verb", itemId: { in: verbIds } },
          ],
        },
      })
    : []

  const hoje = new Date()
  const inicioDia = new Date(hoje)
  inicioDia.setHours(0, 0, 0, 0)
  const fimDia = new Date(hoje)
  fimDia.setHours(23, 59, 59, 999)

  // Itens com ReviewState
  const wordReviewIds = new Set(reviewStates.filter(r => r.itemType === "word").map(r => r.itemId))
  const verbReviewIds = new Set(reviewStates.filter(r => r.itemType === "verb").map(r => r.itemId))

  // Itens novos disponíveis (sem ReviewState ainda)
  const novosDisponiveis =
    wordIds.filter(id => !wordReviewIds.has(id)).length +
    verbIds.filter(id => !verbReviewIds.has(id)).length

  // Novos já introduzidos hoje (ReviewState criado hoje)
  const novosHoje = reviewStates.filter(
    r => r.introduzidoEm >= inicioDia && r.introduzidoEm <= fimDia
  ).length

  // Revisões devidas hoje (têm ReviewState e estão vencidas)
  const revisoesDue = reviewStates.filter(r => r.proximaRevisao <= fimDia).length

  // Novos que ainda faltam introduzir hoje (até ao máximo de 20)
  const novosParaHoje = Math.max(0, Math.min(20 - novosHoje, novosDisponiveis))

  // Itens revisados hoje (ultimaRevisao >= início do dia)
  const itensRevisadosHoje = reviewStates.filter(
    r => r.ultimaRevisao >= inicioDia && r.ultimaRevisao <= fimDia
  ).length

  // Progresso do nível (itens revistos ao menos uma vez)
  const itensCompletos = reviewStates.filter(r => r.repeticoes >= 1).length
  const percentagemNivel = totalItens > 0 ? Math.round((itensCompletos / totalItens) * 100) : 0
  const podeAvancar = totalItens > 0 && itensCompletos === totalItens

  return NextResponse.json({
    nivelCodigo,
    percentagemNivel,
    itensCompletos,
    totalItens,
    novosHoje,
    novosParaHoje,
    revisoesDue,
    totalHoje: novosParaHoje + revisoesDue,
    itensRevisadosHoje,
    podeAvancar,
  })
}
