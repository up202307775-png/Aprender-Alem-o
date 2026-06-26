import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const userState = await prisma.userState.findUnique({
    where: { id: 1 },
    include: {
      currentLevel: true,
      currentModule: true,
    },
  })

  if (!userState) {
    return NextResponse.json({ erro: "UserState não encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    currentLevelId: userState.currentLevelId,
    currentLevelCodigo: userState.currentLevel.codigo,
    currentLevelNome: userState.currentLevel.nome,
    currentModuleId: userState.currentModuleId,
    currentModuleTitulo: userState.currentModule.titulo,
  })
}

// POST /api/user-state — avança para o nível seguinte (só se podeAvancar = true)
export async function POST() {
  const userState = await prisma.userState.findUnique({
    where: { id: 1 },
    include: { currentLevel: true },
  })

  if (!userState) {
    return NextResponse.json({ erro: "UserState não encontrado" }, { status: 404 })
  }

  // Verificar se o nível atual está realmente completo
  const currentLevelId = userState.currentLevelId
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

  if (totalItens === 0) {
    return NextResponse.json({ erro: "Nível sem conteúdo" }, { status: 400 })
  }

  const reviewStates = await prisma.reviewState.findMany({
    where: {
      OR: [
        { itemType: "word", itemId: { in: wordIds } },
        { itemType: "verb", itemId: { in: verbIds } },
      ],
      repeticoes: { gte: 1 },
    },
    select: { id: true },
  })

  if (reviewStates.length < totalItens) {
    return NextResponse.json({ erro: "Nível ainda não está completo" }, { status: 400 })
  }

  // Encontrar o próximo nível
  const proximoNivel = await prisma.level.findFirst({
    where: { ordem: { gt: userState.currentLevel.ordem } },
    orderBy: { ordem: "asc" },
    include: { modules: { orderBy: { ordem: "asc" }, take: 1 } },
  })

  if (!proximoNivel) {
    return NextResponse.json({ mensagem: "Já está no nível máximo!" })
  }

  if (proximoNivel.modules.length === 0) {
    return NextResponse.json({ erro: "Próximo nível não tem módulos" }, { status: 400 })
  }

  const novoUserState = await prisma.userState.update({
    where: { id: 1 },
    data: {
      currentLevelId: proximoNivel.id,
      currentModuleId: proximoNivel.modules[0].id,
    },
    include: { currentLevel: true },
  })

  return NextResponse.json({
    mensagem: `Avançaste para o nível ${novoUserState.currentLevel.codigo}!`,
    novoNivel: novoUserState.currentLevel.codigo,
  })
}
