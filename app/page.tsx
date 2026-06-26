import Link from "next/link"
import { prisma } from "@/lib/prisma"
import NivelBadge from "@/components/NivelBadge"

export const dynamic = "force-dynamic"

const ZONAS = [
  { href: "/vocabulario", emoji: "📖", titulo: "Vocabulário", desc: "Flashcards com revisão espaçada", cor: "border-blue-200 hover:border-blue-400" },
  { href: "/verbos",      emoji: "🔤", titulo: "Verbos",      desc: "Conjugações com raiz destacada",  cor: "border-purple-200 hover:border-purple-400" },
  { href: "/gramatica",   emoji: "📐", titulo: "Gramática",   desc: "Módulos com mini-exercícios",     cor: "border-yellow-200 hover:border-yellow-400" },
  { href: "/quiz",        emoji: "🎯", titulo: "Quizzes",     desc: "Produção escrita e ditado",       cor: "border-red-200 hover:border-red-400" },
  { href: "/escrita",     emoji: "✍️", titulo: "Escrita",     desc: "Correção com IA",                 cor: "border-amber-200 hover:border-amber-400" },
  { href: "/fala",        emoji: "🎙️", titulo: "Fala",        desc: "Pronúncia com reconhecimento de voz", cor: "border-teal-200 hover:border-teal-400" },
  { href: "/dashboard",   emoji: "📊", titulo: "Dashboard",   desc: "Streak e progresso detalhado",   cor: "border-gray-200 hover:border-gray-400" },
] as const

async function getSessaoHoje() {
  try {
    const userState = await prisma.userState.findUnique({
      where: { id: 1 },
      include: { currentLevel: true },
    })
    if (!userState) return null

    const currentLevelId = userState.currentLevelId
    const nivelCodigo = userState.currentLevel.codigo

    const [words, verbs] = await Promise.all([
      prisma.word.findMany({ where: { module: { levelId: currentLevelId } }, select: { id: true } }),
      prisma.verb.findMany({ where: { module: { levelId: currentLevelId } }, select: { id: true } }),
    ])

    const wordIds = words.map(w => w.id)
    const verbIds = verbs.map(v => v.id)
    const totalItens = wordIds.length + verbIds.length

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
    const inicioDia = new Date(hoje); inicioDia.setHours(0, 0, 0, 0)
    const fimDia = new Date(hoje); fimDia.setHours(23, 59, 59, 999)

    const wordReviewIds = new Set(reviewStates.filter(r => r.itemType === "word").map(r => r.itemId))
    const verbReviewIds = new Set(reviewStates.filter(r => r.itemType === "verb").map(r => r.itemId))

    const novosDisponiveis =
      wordIds.filter(id => !wordReviewIds.has(id)).length +
      verbIds.filter(id => !verbReviewIds.has(id)).length

    const novosHoje = reviewStates.filter(r => r.introduzidoEm >= inicioDia && r.introduzidoEm <= fimDia).length
    const revisoesDue = reviewStates.filter(r => r.proximaRevisao <= fimDia).length
    const novosParaHoje = Math.max(0, Math.min(20 - novosHoje, novosDisponiveis))

    const itensCompletos = reviewStates.filter(r => r.repeticoes >= 1).length
    const percentagemNivel = totalItens > 0 ? Math.round((itensCompletos / totalItens) * 100) : 0
    const podeAvancar = totalItens > 0 && itensCompletos === totalItens
    const faltamParaDesbloquear = totalItens - itensCompletos

    return {
      nivelCodigo,
      percentagemNivel,
      totalItens,
      itensCompletos,
      faltamParaDesbloquear,
      novosParaHoje,
      revisoesDue,
      totalHoje: novosParaHoje + revisoesDue,
      podeAvancar,
    }
  } catch {
    return null
  }
}

export default async function Home() {
  const sessao = await getSessaoHoje()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <h1 className="text-3xl font-bold text-blue-700 mb-1">Aprender Alemão</h1>
        <p className="text-gray-500 text-sm mb-6">Revisão espaçada por níveis CEFR</p>

        {sessao && (
          <>
            {/* Nível atual + progresso */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <NivelBadge nivel={sessao.nivelCodigo} className="text-sm px-3 py-1" />
                <span className="text-gray-700 font-medium">
                  {sessao.percentagemNivel}% completo
                </span>
                {sessao.podeAvancar && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                    Pronto para avançar!
                  </span>
                )}
              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${sessao.percentagemNivel}%` }}
                />
              </div>

              <p className="text-xs text-gray-400">
                {sessao.itensCompletos} de {sessao.totalItens} itens revistos
                {!sessao.podeAvancar && sessao.faltamParaDesbloquear > 0 &&
                  ` · faltam ${sessao.faltamParaDesbloquear} para desbloquear o próximo nível`}
              </p>
            </div>

            {/* Sessão de hoje */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Sessão de hoje
              </p>

              <div className="flex gap-4 mb-4">
                <div className="text-center flex-1">
                  <p className="text-3xl font-bold text-blue-600">{sessao.revisoesDue}</p>
                  <p className="text-xs text-gray-400 mt-1">revisões</p>
                </div>
                <div className="text-gray-200 flex items-center text-2xl">+</div>
                <div className="text-center flex-1">
                  <p className="text-3xl font-bold text-green-600">{sessao.novosParaHoje}</p>
                  <p className="text-xs text-gray-400 mt-1">novos</p>
                </div>
                <div className="text-gray-200 flex items-center text-2xl">=</div>
                <div className="text-center flex-1">
                  <p className="text-3xl font-bold text-gray-700">{sessao.totalHoje}</p>
                  <p className="text-xs text-gray-400 mt-1">total</p>
                </div>
              </div>

              {sessao.totalHoje > 0 ? (
                <Link
                  href="/vocabulario"
                  className="block w-full text-center py-3 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Começar sessão &rarr; {sessao.totalHoje} itens
                </Link>
              ) : (
                <div className="w-full text-center py-3 px-4 rounded-xl text-sm bg-gray-50 text-gray-400 font-medium">
                  Tudo feito por hoje! Volta amanhã.
                </div>
              )}
            </div>
          </>
        )}

        {/* Grelha de zonas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ZONAS.map(zona => (
            <Link
              key={zona.href}
              href={zona.href}
              className={`bg-white rounded-2xl border-2 p-4 shadow-sm transition-all hover:shadow-md ${zona.cor}`}
            >
              <span className="text-2xl block mb-1">{zona.emoji}</span>
              <p className="font-semibold text-gray-800 text-sm">{zona.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{zona.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
