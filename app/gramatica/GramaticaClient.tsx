"use client"

import { useState } from "react"
import Link from "next/link"

type Exercicio = {
  id: number
  tipo: "escolha-multipla" | "preenchimento" | "ordenacao"
  pergunta: string
  opcoes?: string[]
  resposta: string
  explicacao: string
}

type Modulo = {
  id: number
  titulo: string
  conteudo: string
  exercicios: Exercicio[]
}

type EstadoEx = { respondido: boolean; respostaDada: string; correto: boolean }

// ─── Renderizador de markdown mínimo ─────────────────────────────────────────

function renderInline(texto: string): React.ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function ConteudoMarkdown({ texto }: { texto: string }) {
  return (
    <div className="text-sm space-y-1.5 text-gray-700">
      {texto.split("\n").map((linha, i) => {
        const t = linha.trim()
        if (!t) return <div key={i} className="h-1.5" />
        if (t.match(/^\|[\s\-|:]+\|$/)) return null // separator
        if (t.startsWith("# ")) return <h2 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-1">{renderInline(t.slice(2))}</h2>
        if (t.startsWith("## ")) return <h3 key={i} className="text-base font-semibold text-gray-700 mt-3 mb-0.5">{renderInline(t.slice(3))}</h3>
        if (t.startsWith("| ")) {
          const cols = t.split("|").filter(c => c.trim())
          return (
            <div key={i} className="flex text-xs border-b border-gray-100 py-1">
              {cols.map((c, j) => (
                <span key={j} className="flex-1 px-2 min-w-0">
                  {renderInline(c.trim())}
                </span>
              ))}
            </div>
          )
        }
        if (t.startsWith("- ") || t.startsWith("* "))
          return <li key={i} className="ml-4 list-disc">{renderInline(t.slice(2))}</li>
        return <p key={i}>{renderInline(t)}</p>
      })}
    </div>
  );
}

// ─── Exercício interativo ─────────────────────────────────────────────────────

function ExercicioInterativo({
  ex,
  chave,
  estado,
  onResponder,
}: {
  ex: Exercicio
  chave: string
  estado: EstadoEx | undefined
  onResponder: (chave: string, dada: string, correto: boolean) => void
}) {
  const [input, setInput] = useState("")

  function verificar(dada: string) {
    const correto = dada.trim().toLowerCase() === ex.resposta.trim().toLowerCase()
    onResponder(chave, dada, correto)
  }

  return (
    <div className={`rounded-xl border p-4 ${estado ? (estado.correto ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50") : "border-gray-200 bg-white"}`}>
      <p className="text-sm font-medium text-gray-800 mb-3">{ex.pergunta}</p>

      {ex.tipo === "escolha-multipla" && ex.opcoes && !estado && (
        <div className="flex flex-wrap gap-2">
          {ex.opcoes.map(op => (
            <button
              key={op}
              onClick={() => verificar(op)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {op}
            </button>
          ))}
        </div>
      )}

      {(ex.tipo === "preenchimento" || ex.tipo === "ordenacao") && !estado && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && input.trim() && verificar(input)}
            placeholder="Escreve a tua resposta…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={() => input.trim() && verificar(input)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Verificar
          </button>
        </div>
      )}

      {estado && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={estado.correto ? "text-green-600" : "text-red-600"}>
              {estado.correto ? "✓ Correto!" : "✗ Errado"}
            </span>
            {!estado.correto && (
              <span className="text-sm text-gray-700">
                Resposta: <span className="font-semibold">{ex.resposta}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 italic">{ex.explicacao}</p>
        </div>
      )}
    </div>
  )
}

// ─── Card de módulo (acordeão) ────────────────────────────────────────────────

function ModuloCard({
  modulo,
  aberto,
  estadosEx,
  onToggle,
  onResponder,
}: {
  modulo: Modulo
  aberto: boolean
  estadosEx: Record<string, EstadoEx>
  onToggle: () => void
  onResponder: (chave: string, dada: string, correto: boolean) => void
}) {
  const totalEx = modulo.exercicios.length
  const respondidos = modulo.exercicios.filter(e => estadosEx[`${modulo.id}-${e.id}`]).length
  const acertos = modulo.exercicios.filter(e => estadosEx[`${modulo.id}-${e.id}`]?.correto).length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-800">{modulo.titulo}</p>
            {respondidos > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {acertos}/{totalEx} corretos
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {respondidos === totalEx && totalEx > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ completo
              </span>
            )}
            <span className="text-gray-400">{aberto ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {aberto && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          <ConteudoMarkdown texto={modulo.conteudo} />
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Mini-exercícios
            </h4>
            {modulo.exercicios.map(ex => (
              <ExercicioInterativo
                key={ex.id}
                ex={ex}
                chave={`${modulo.id}-${ex.id}`}
                estado={estadosEx[`${modulo.id}-${ex.id}`]}
                onResponder={onResponder}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function GramaticaClient({ modulos }: { modulos: Modulo[] }) {
  const [moduloAberto, setModuloAberto] = useState<number | null>(null)
  const [estadosEx, setEstadosEx] = useState<Record<string, EstadoEx>>({})

  function handleResponder(chave: string, dada: string, correto: boolean) {
    setEstadosEx(prev => ({ ...prev, [chave]: { respondido: true, respostaDada: dada, correto } }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
          <h1 className="text-2xl font-bold text-gray-800">Gramática</h1>
        </div>

        <div className="space-y-3">
          {modulos.map(m => (
            <ModuloCard
              key={m.id}
              modulo={m}
              aberto={moduloAberto === m.id}
              estadosEx={estadosEx}
              onToggle={() => setModuloAberto(prev => prev === m.id ? null : m.id)}
              onResponder={handleResponder}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
