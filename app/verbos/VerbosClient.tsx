"use client"

import { useState } from "react"
import Link from "next/link"
import BotaoAudio from "@/components/BotaoAudio"
import NivelBadge from "@/components/NivelBadge"

type ConjugacoesTipo = {
  prasens: Record<string, string>
  prateritum: Record<string, string>
  perfekt: string
}

type VerbData = {
  id: number
  infinitivo: string
  traducaoPt: string
  raiz: string
  separavel: boolean
  irregular: boolean
  conjugacoes: ConjugacoesTipo
  nivel: string
}

// Ordem canónica das pessoas
const PESSOAS = ["ich", "du", "er", "wir", "ihr", "sie"] as const
const ROTULO_PESSOA: Record<string, string> = {
  ich: "ich",
  du: "du",
  er: "er/sie/es",
  wir: "wir",
  ihr: "ihr",
  sie: "sie/Sie",
}

// ─── Destaque da raiz numa forma conjugada ────────────────────────────────────

function FormaComRaiz({ forma, raiz }: { forma: string; raiz: string }) {
  const stem = raiz.replace(/-$/, "")
  if (!stem) return <span>{forma}</span>

  const idx = forma.indexOf(stem)
  if (idx === -1) {
    // Forma irregular com mudança vocálica — não destaca
    return <span className="text-orange-700">{forma}</span>
  }

  return (
    <span>
      {forma.slice(0, idx)}
      <span className="font-bold text-blue-700">{stem}</span>
      {forma.slice(idx + stem.length)}
    </span>
  )
}

// ─── Prefixo separável destacado no infinitivo ────────────────────────────────

function InfinitivoDisplay({
  infinitivo,
  raiz,
  separavel,
}: {
  infinitivo: string
  raiz: string
  separavel: boolean
}) {
  if (!separavel || !raiz) return <span>{infinitivo}</span>

  const stem = raiz.replace(/-$/, "")
  const idx = infinitivo.indexOf(stem)
  if (idx <= 0) return <span>{infinitivo}</span>

  const prefixo = infinitivo.slice(0, idx)
  const resto = infinitivo.slice(idx)
  return (
    <span>
      <span className="font-bold text-purple-700">{prefixo}</span>
      <span>{resto}</span>
    </span>
  )
}

// ─── Card de verbo ────────────────────────────────────────────────────────────

function CartaoVerbo({ verbo }: { verbo: VerbData }) {
  const [aberto, setAberto] = useState(false)
  const { prasens, prateritum, perfekt } = verbo.conjugacoes

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <button
        className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setAberto(v => !v)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-bold text-gray-800">
              <InfinitivoDisplay
                infinitivo={verbo.infinitivo}
                raiz={verbo.raiz}
                separavel={verbo.separavel}
              />
            </span>
            <span className="text-sm text-gray-500">— {verbo.traducaoPt}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Badges */}
            {verbo.nivel && <NivelBadge nivel={verbo.nivel} />}
            {verbo.separavel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                separável
              </span>
            )}
            {verbo.irregular && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                irregular
              </span>
            )}
            <BotaoAudio texto={verbo.infinitivo} />
            <span className="text-gray-400 text-sm">{aberto ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Raiz */}
        {verbo.raiz && (
          <p className="text-xs text-gray-400 italic mt-1">
            raiz: <span className="font-semibold text-blue-600">{verbo.raiz}</span>
          </p>
        )}
      </button>

      {/* Tabela de conjugação */}
      {aberto && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">

            {/* Präsens */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Präsens
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {PESSOAS.map(p => (
                    <tr key={p} className="border-b border-gray-50 last:border-0">
                      <td className="py-1 pr-3 text-gray-400 w-20">{ROTULO_PESSOA[p]}</td>
                      <td className="py-1 font-medium">
                        <FormaComRaiz forma={prasens[p] ?? "—"} raiz={verbo.raiz} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Präteritum */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                Präteritum
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {PESSOAS.map(p => (
                    <tr key={p} className="border-b border-gray-50 last:border-0">
                      <td className="py-1 pr-3 text-gray-400 w-20">{ROTULO_PESSOA[p]}</td>
                      <td className="py-1 font-medium">
                        <FormaComRaiz forma={prateritum[p] ?? "—"} raiz={verbo.raiz} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perfekt */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-0.5">
                Perfekt
              </span>
              <span className="text-sm font-medium text-gray-700">
                <FormaComRaiz forma={perfekt} raiz={verbo.raiz} />
              </span>
            </div>
            <BotaoAudio texto={`${verbo.infinitivo}: ${perfekt}`} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VerbosClient({ verbos }: { verbos: VerbData[] }) {
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "separavel" | "irregular">("todos")
  const [filtroNivel, setFiltroNivel] = useState("todos")

  // Níveis presentes nos verbos (ordenados)
  const ORDEM_NIVEIS = ["A1", "A2", "B1", "B2", "C1", "C2"]
  const niveisPresentes = ["todos", ...ORDEM_NIVEIS.filter(n => verbos.some(v => v.nivel === n))]

  const verbosFiltrados = verbos.filter(v => {
    const passaTipo =
      filtroTipo === "todos" ||
      (filtroTipo === "separavel" && v.separavel) ||
      (filtroTipo === "irregular" && v.irregular)
    const passaNivel = filtroNivel === "todos" || v.nivel === filtroNivel
    return passaTipo && passaNivel
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
          <h1 className="text-2xl font-bold text-gray-800">Verbos</h1>
          <span className="text-sm text-gray-400">{verbosFiltrados.length} verbos</span>
        </div>

        {/* Filtro por nível CEFR */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          {niveisPresentes.map(n => (
            <button
              key={n}
              onClick={() => setFiltroNivel(n)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroNivel === n
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {n === "todos" ? "Todos os níveis" : <NivelBadge nivel={n} />}
            </button>
          ))}
        </div>

        {/* Filtros por tipo */}
        <div className="flex gap-2 mb-4">
          {(["todos", "separavel", "irregular"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroTipo(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroTipo === f
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
              }`}
            >
              {f === "todos" ? "Todos" : f === "separavel" ? "Separáveis" : "Irregulares"}
            </button>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            raiz presente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            forma com mudança vocálica
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
            prefixo separável
          </span>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {verbosFiltrados.map(v => (
            <CartaoVerbo key={v.id} verbo={v} />
          ))}
        </div>

        {verbosFiltrados.length === 0 && (
          <p className="text-center text-gray-400 py-16">Nenhum verbo encontrado.</p>
        )}
      </div>
    </div>
  )
}
