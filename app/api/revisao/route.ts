import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularProximaRevisao, type Resultado } from "@/lib/sm2"

const NOVOS_POR_DIA = 20

function intercalar<A, B>(arr1: A[], arr2: B[]): (A | B)[] {
  const resultado: (A | B)[] = []
  const tamanho = Math.max(arr1.length, arr2.length)
  for (let i = 0; i < tamanho; i++) {
    if (i < arr1.length) resultado.push(arr1[i])
    if (i < arr2.length) resultado.push(arr2[i])
  }
  return resultado
}

// GET /api/revisao?limite=N
// Devolve itens do nível atual: revisões devidas + novos (até 20/dia)
export async function GET(req: NextRequest) {
  const limite = Number(new URL(req.url).searchParams.get("limite")) || Infinity

  const userState = await prisma.userState.findUnique({ where: { id: 1 } })
  const currentLevelId = userState?.currentLevelId

  const hoje = new Date()
  const inicioDia = new Date(hoje)
  inicioDia.setHours(0, 0, 0, 0)
  const fimDia = new Date(hoje)
  fimDia.setHours(23, 59, 59, 999)

  // Buscar palavras e verbos do nível atual
  const whereLevel = currentLevelId
    ? { module: { levelId: currentLevelId } }
    : {}

  const [todasPalavras, todosVerbos] = await Promise.all([
    prisma.word.findMany({
      where: whereLevel,
      orderBy: [{ module: { ordem: "asc" } }, { id: "asc" }],
    }),
    prisma.verb.findMany({
      where: whereLevel,
      orderBy: [{ module: { ordem: "asc" } }, { id: "asc" }],
    }),
  ])

  const wordIds = todasPalavras.map(w => w.id)
  const verbIds = todosVerbos.map(v => v.id)

  // ReviewStates existentes para estes itens
  const reviewStates = await prisma.reviewState.findMany({
    where: {
      OR: [
        { itemType: "word", itemId: { in: wordIds } },
        { itemType: "verb", itemId: { in: verbIds } },
      ],
    },
  })

  const rsMapWord = new Map(
    reviewStates.filter(r => r.itemType === "word").map(r => [r.itemId, r])
  )
  const rsMapVerb = new Map(
    reviewStates.filter(r => r.itemType === "verb").map(r => [r.itemId, r])
  )

  // Revisões devidas hoje
  const palavrasRevisao = todasPalavras
    .filter(p => {
      const rs = rsMapWord.get(p.id)
      return rs && rs.proximaRevisao <= fimDia
    })
    .map(p => ({ tipo: "word" as const, item: p, estado: rsMapWord.get(p.id)! }))

  const verbosRevisao = todosVerbos
    .filter(v => {
      const rs = rsMapVerb.get(v.id)
      return rs && rs.proximaRevisao <= fimDia
    })
    .map(v => ({ tipo: "verb" as const, item: v, estado: rsMapVerb.get(v.id)! }))

  // Novos já introduzidos hoje (ReviewState com introduzidoEm = hoje)
  const novosHoje = reviewStates.filter(
    r => r.introduzidoEm >= inicioDia && r.introduzidoEm <= fimDia
  ).length

  const vagasParaNovos = Math.max(0, NOVOS_POR_DIA - novosHoje)

  // Itens novos (sem ReviewState), respeitando ordem do módulo
  const palavrasNovas = todasPalavras
    .filter(p => !rsMapWord.has(p.id))
    .slice(0, vagasParaNovos)
    .map(p => ({ tipo: "word" as const, item: p, estado: null }))

  const vagasVerbosNovos = Math.max(0, vagasParaNovos - palavrasNovas.length)
  const verbosNovos = todosVerbos
    .filter(v => !rsMapVerb.has(v.id))
    .slice(0, vagasVerbosNovos)
    .map(v => ({ tipo: "verb" as const, item: v, estado: null }))

  // Combinar: revisões intercaladas + novos no fim
  const revisoes = intercalar(palavrasRevisao, verbosRevisao)
  const novos = intercalar(palavrasNovas, verbosNovos)
  const itens = [...revisoes, ...novos].slice(0, limite)

  return NextResponse.json({ itens, total: itens.length })
}

// POST /api/revisao
// Body: { itemType, itemId, resultado }
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

  // Verificar se o item já tinha ReviewState (novo vs. revisão)
  const estadoExistente = await prisma.reviewState.findUnique({
    where: { itemType_itemId: { itemType, itemId } },
  })

  const eNovo = !estadoExistente

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
      introduzidoEm: new Date(),
    },
    update: {},
  })

  const atualizacao = calcularProximaRevisao(estadoAtual.repeticoes, resultado)
  const novoEstado = await prisma.reviewState.update({
    where: { id: estadoAtual.id },
    data: atualizacao,
  })

  // Atualizar sessão de estudo de hoje
  const inicioDoDia = new Date()
  inicioDoDia.setHours(0, 0, 0, 0)
  const fimDoDia = new Date()
  fimDoDia.setHours(23, 59, 59, 999)

  const acertou = resultado !== "errei"
  const sessaoHoje = await prisma.studySession.findFirst({
    where: { data: { gte: inicioDoDia, lte: fimDoDia } },
  })

  if (sessaoHoje) {
    await prisma.studySession.update({
      where: { id: sessaoHoje.id },
      data: {
        itensRevistos: { increment: 1 },
        acertos: acertou ? { increment: 1 } : undefined,
        novosIntroducidos: eNovo ? { increment: 1 } : undefined,
      },
    })
  } else {
    await prisma.studySession.create({
      data: {
        itensRevistos: 1,
        acertos: acertou ? 1 : 0,
        novosIntroducidos: eNovo ? 1 : 0,
        modo: "flashcard",
      },
    })
  }

  // Atualizar Progress do módulo do item
  const moduleId = await getModuleId(itemType, itemId)
  if (moduleId) {
    await atualizarProgress(moduleId)
  }

  return NextResponse.json({ estado: novoEstado })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getModuleId(itemType: string, itemId: number): Promise<number | null> {
  if (itemType === "word") {
    const w = await prisma.word.findUnique({ where: { id: itemId }, select: { moduleId: true } })
    return w?.moduleId ?? null
  }
  if (itemType === "verb") {
    const v = await prisma.verb.findUnique({ where: { id: itemId }, select: { moduleId: true } })
    return v?.moduleId ?? null
  }
  return null
}

async function atualizarProgress(moduleId: number) {
  const [totalWords, totalVerbs, revistoWords, revistoVerbs] = await Promise.all([
    prisma.word.count({ where: { moduleId } }),
    prisma.verb.count({ where: { moduleId } }),
    prisma.reviewState.count({
      where: {
        itemType: "word",
        itemId: { in: await prisma.word.findMany({ where: { moduleId }, select: { id: true } }).then(ws => ws.map(w => w.id)) },
        repeticoes: { gte: 1 },
      },
    }),
    prisma.reviewState.count({
      where: {
        itemType: "verb",
        itemId: { in: await prisma.verb.findMany({ where: { moduleId }, select: { id: true } }).then(vs => vs.map(v => v.id)) },
        repeticoes: { gte: 1 },
      },
    }),
  ])

  const total = totalWords + totalVerbs
  const revistos = revistoWords + revistoVerbs
  const percentagem = total > 0 ? (revistos / total) * 100 : 0
  const terminado = total > 0 && revistos >= total

  await prisma.progress.upsert({
    where: { moduleId },
    create: { moduleId, percentagem, terminado, ultimaAtividade: new Date() },
    update: { percentagem, terminado, ultimaAtividade: new Date() },
  })
}
