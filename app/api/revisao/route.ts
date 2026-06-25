import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { calcularProximaRevisao, type Resultado } from "@/lib/sm2"

// Garante que cada Word e Verb tem um ReviewState criado (estado inicial: tudo devido hoje)
async function garantirEstados() {
  const [words, verbs, existentes] = await Promise.all([
    prisma.word.findMany({ select: { id: true } }),
    prisma.verb.findMany({ select: { id: true } }),
    prisma.reviewState.findMany({
      where: { itemType: { in: ["word", "verb"] } },
      select: { itemType: true, itemId: true },
    }),
  ])

  const chaves = new Set(existentes.map(e => `${e.itemType}-${e.itemId}`))

  const novos = [
    ...words
      .filter(w => !chaves.has(`word-${w.id}`))
      .map(w => ({ itemType: "word", itemId: w.id })),
    ...verbs
      .filter(v => !chaves.has(`verb-${v.id}`))
      .map(v => ({ itemType: "verb", itemId: v.id })),
  ]

  if (novos.length === 0) return

  await prisma.reviewState.createMany({
    data: novos.map(item => ({
      ...item,
      intervaloDias: 1,
      fatorFacilidade: 2.5,
      repeticoes: 0,
      proximaRevisao: new Date(),
      ultimaRevisao: new Date(),
    })),
  })
}

// Intercala dois arrays alternando elementos: [a1, b1, a2, b2, ...]
function intercalar<A, B>(arr1: A[], arr2: B[]): (A | B)[] {
  const resultado: (A | B)[] = []
  const tamanho = Math.max(arr1.length, arr2.length)
  for (let i = 0; i < tamanho; i++) {
    if (i < arr1.length) resultado.push(arr1[i])
    if (i < arr2.length) resultado.push(arr2[i])
  }
  return resultado
}

// GET /api/revisao — devolve todos os itens (palavras + verbos) devidos hoje,
// intercalados para maximizar a aprendizagem por interleaving.
export async function GET() {
  await garantirEstados()

  const fimDoDia = new Date()
  fimDoDia.setHours(23, 59, 59, 999)

  const estados = await prisma.reviewState.findMany({
    where: {
      itemType: { in: ["word", "verb"] },
      proximaRevisao: { lte: fimDoDia },
    },
  })

  const wordIds = estados.filter(e => e.itemType === "word").map(e => e.itemId)
  const verbIds = estados.filter(e => e.itemType === "verb").map(e => e.itemId)

  const [palavras, verbos] = await Promise.all([
    prisma.word.findMany({ where: { id: { in: wordIds } } }),
    prisma.verb.findMany({ where: { id: { in: verbIds } } }),
  ])

  const itensPalavras = palavras.map(p => ({
    tipo: "word" as const,
    item: p,
    estado: estados.find(e => e.itemType === "word" && e.itemId === p.id)!,
  }))

  const itensVerbos = verbos.map(v => ({
    tipo: "verb" as const,
    item: v,
    estado: estados.find(e => e.itemType === "verb" && e.itemId === v.id)!,
  }))

  const itens = intercalar(itensPalavras, itensVerbos)

  return NextResponse.json({ itens, total: itens.length })
}

// POST /api/revisao — recebe o resultado de um item e atualiza o seu ReviewState.
// Body: { itemType: "word"|"verb", itemId: number, resultado: "errei"|"difícil"|"bom"|"fácil" }
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    itemType: string
    itemId: number
    resultado: Resultado
  }

  const { itemType, itemId, resultado } = body

  if (
    !["word", "verb"].includes(itemType) ||
    typeof itemId !== "number" ||
    !["errei", "difícil", "bom", "fácil"].includes(resultado)
  ) {
    return NextResponse.json({ erro: "Parâmetros inválidos" }, { status: 400 })
  }

  // Obtém o estado atual (cria se ainda não existir)
  const estadoAtual = await prisma.reviewState.upsert({
    where: { itemType_itemId: { itemType, itemId } },
    create: {
      itemType,
      itemId,
      intervaloDias: 1,
      fatorFacilidade: 2.5,
      repeticoes: 0,
      proximaRevisao: new Date(),
      ultimaRevisao: new Date(),
    },
    update: {},
  })

  // Calcula e grava o novo estado via algoritmo SM-2
  const atualizacao = calcularProximaRevisao(estadoAtual.repeticoes, resultado)

  const novoEstado = await prisma.reviewState.update({
    where: { id: estadoAtual.id },
    data: atualizacao,
  })

  // Atualiza ou cria a sessão de estudo de hoje
  const inicioDoDia = new Date()
  inicioDoDia.setHours(0, 0, 0, 0)
  const fimDoDia = new Date()
  fimDoDia.setHours(23, 59, 59, 999)

  const sessaoHoje = await prisma.studySession.findFirst({
    where: { data: { gte: inicioDoDia, lte: fimDoDia } },
  })

  const acertou = resultado !== "errei"

  if (sessaoHoje) {
    await prisma.studySession.update({
      where: { id: sessaoHoje.id },
      data: acertou
        ? { itensRevistos: { increment: 1 }, acertos: { increment: 1 } }
        : { itensRevistos: { increment: 1 } },
    })
  } else {
    await prisma.studySession.create({
      data: {
        itensRevistos: 1,
        acertos: acertou ? 1 : 0,
        modo: "flashcard",
      },
    })
  }

  return NextResponse.json({ estado: novoEstado })
}
