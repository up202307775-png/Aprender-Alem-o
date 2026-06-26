"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import NivelBadge from "@/components/NivelBadge"
import BotaoAudio from "@/components/BotaoAudio"

type ConjugacoesTipo = {
  prasens: Record<string, string>
  perfekt: string
}

type ItemSessao = {
  id: number
  tipo: "word" | "verb"
  // word
  alemao?: string
  artigo?: string
  genero?: string
  plural?: string
  exemplo?: string
  raiz?: string
  // verb
  infinitivo?: string
  separavel?: boolean
  irregular?: boolean
  conjugacoes?: ConjugacoesTipo
  // common
  traducaoPt: string
  nivel: string
  eNovo: boolean
}

type Resultado = "errei" | "difícil" | "bom" | "fácil"
type EstadoCard = "pergunta" | "revelado"

const BOTOES_RESULTADO: { r: Resultado; label: string; cls: string }[] = [
  { r: "errei",   label: "Errei",   cls: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200" },
  { r: "difícil", label: "Difícil", cls: "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200" },
  { r: "bom",     label: "Bom",     cls: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200" },
  { r: "fácil",   label: "Fácil",   cls: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" },
]

function CartaoWord({ item }: { item: ItemSessao }) {
  const isChunk = !item.artigo
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {item.artigo && (
          <span className={`text-lg font-semibold ${
            item.artigo === "der" ? "text-blue-600" :
            item.artigo === "die" ? "text-red-600" : "text-green-600"
          }`}>{item.artigo}</span>
        )}
        <span className="text-3xl font-bold text-gray-900">{item.artigo ? item.alemao!.replace(item.artigo + " ", "") : item.alemao}</span>
        <BotaoAudio texto={item.alemao ?? ""} />
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {item.genero && item.genero !== "—" && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{item.genero}</span>
        )}
        {item.plural && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">Pl: {item.plural}</span>
        )}
        {isChunk && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">expressão</span>
        )}
      </div>
      {item.exemplo && (
        <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2 mt-1">
          <BotaoAudio texto={item.exemplo} className="shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 italic">{item.exemplo}</p>
        </div>
      )}
    </div>
  )
}

function CartaoVerb({ item }: { item: ItemSessao }) {
  const prasens = item.conjugacoes?.prasens ?? {}
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-3xl font-bold text-gray-900">{item.infinitivo}</span>
        <BotaoAudio texto={item.infinitivo ?? ""} />
        {item.separavel && (
          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">separável</span>
        )}
        {item.irregular && (
          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">irregular</span>
        )}
      </div>
      {Object.keys(prasens).length > 0 && (
        <div className="bg-gray-50 rounded-xl px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {["ich","du","er","wir","ihr","sie"].map(p => (
            <div key={p} className="flex gap-2">
              <span className="text-gray-400 w-8">{p === "er" ? "er" : p}</span>
              <span className="font-medium">{prasens[p] ?? "—"}</span>
            </div>
          ))}
        </div>
      )}
      {item.conjugacoes?.perfekt && (
        <p className="text-sm text-gray-500">Perfekt: <span className="font-semibold text-gray-700">{item.conjugacoes.perfekt}</span></p>
      )}
    </div>
  )
}

export default function SessaoClient({ itens }: { itens: ItemSessao[] }) {
  const [indice, setIndice] = useState(0)
  const [estado, setEstado] = useState<EstadoCard>("pergunta")
  const [revistos, setRevistos] = useState<number>(0)
  const [concluida, setConcluida] = useState(false)

  const total = itens.length
  const item = itens[indice]
  const progresso = total > 0 ? Math.round((revistos / total) * 100) : 0

  const revelar = useCallback(() => setEstado("revelado"), [])

  const registar = useCallback(async (resultado: Resultado) => {
    if (!item) return

    // Chama a API sem bloquear a UI
    fetch("/api/revisao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemType: item.tipo,
        itemId: item.id,
        resultado,
      }),
    }).catch(() => {/* silent */})

    const novosRevistos = revistos + 1
    setRevistos(novosRevistos)

    if (novosRevistos >= total) {
      setConcluida(true)
    } else {
      setIndice(i => i + 1)
      setEstado("pergunta")
    }
  }, [item, revistos, total])

  // ─── Sem itens ────────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tudo em dia!</h2>
          <p className="text-sm text-gray-500 mb-6">Não há revisões nem palavras novas para hoje. Volta amanhã!</p>
          <Link href="/" className="block py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm text-center">
            ← Início
          </Link>
        </div>
      </div>
    )
  }

  // ─── Sessão concluída ─────────────────────────────────────────────────────────
  if (concluida) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Sessão concluída!</h2>
          <p className="text-sm text-gray-500 mb-6">Reviste {total} itens hoje.</p>
          <Link
            href="/quiz-diario"
            className="block w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base text-center transition-colors mb-3"
          >
            🎯 Fazer Quiz do Dia →
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  // ─── Card da sessão ────────────────────────────────────────────────────────────
  const isNovo = item.eNovo

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
          <span className="text-sm font-medium text-gray-500">{revistos + 1} / {total}</span>
        </div>

        {/* Barra de progresso */}
        <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 min-h-[260px] flex flex-col">

          {/* Topo: nível + novo/revisão */}
          <div className="flex items-center gap-2 mb-4">
            {item.nivel && <NivelBadge nivel={item.nivel} />}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isNovo ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}>
              {isNovo ? "novo" : "revisão"}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {item.tipo === "verb" ? "verbo" : "vocabulário"}
            </span>
          </div>

          {/* Frente do card: PT */}
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {estado === "pergunta" ? "Como se diz em alemão?" : "Tradução"}
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-1">{item.traducaoPt}</p>

            {/* Revelar ou resposta */}
            {estado === "pergunta" ? (
              <div className="mt-6">
                <button
                  onClick={revelar}
                  className="w-full py-3 rounded-xl border-2 border-blue-400 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Revelar →
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {item.tipo === "word"
                  ? <CartaoWord item={item} />
                  : <CartaoVerb item={item} />
                }
              </div>
            )}
          </div>
        </div>

        {/* Botões de avaliação (só quando revelado) */}
        {estado === "revelado" && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {BOTOES_RESULTADO.map(({ r, label, cls }) => (
              <button
                key={r}
                onClick={() => registar(r)}
                className={`py-3 rounded-xl text-sm font-semibold transition-colors ${cls}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Legenda dos botões */}
        {estado === "revelado" && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Errei → amanhã · Difícil → mantém · Bom → avança · Fácil → salta
          </p>
        )}
      </div>
    </div>
  )
}
