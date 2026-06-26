"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import NivelBadge from "@/components/NivelBadge"

type ItemQuiz = {
  id: string
  tipo: "word" | "verb"
  pergunta: string
  resposta: string
  artigo: string | null
  nivel: string
}

type EstadoResposta = "a-perguntar" | "certa" | "errada"

function normalizar(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ")
}

function verificarResposta(input: string, resposta: string): boolean {
  return normalizar(input) === normalizar(resposta)
}

function embaralhar<T>(arr: T[]): T[] {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export default function QuizDiarioClient({ itensIniciais }: { itensIniciais: ItemQuiz[] }) {
  const [fila, setFila] = useState<ItemQuiz[]>(() => embaralhar(itensIniciais))
  const [indice, setIndice] = useState(0)
  const [input, setInput] = useState("")
  const [estado, setEstado] = useState<EstadoResposta>("a-perguntar")
  const [totalTentativas, setTotalTentativas] = useState(0)
  const [acertosNaPrimeira, setAcertosNaPrimeira] = useState(0)
  const [erradosIds, setErradosIds] = useState<Set<string>>(new Set())
  const [concluido, setConcluido] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalOriginal = itensIniciais.length
  const itemAtual = fila[indice] ?? null
  const progresso = totalOriginal > 0
    ? Math.round(((totalOriginal - fila.length + indice) / totalOriginal) * 100)
    : 0

  useEffect(() => {
    if (estado === "a-perguntar") inputRef.current?.focus()
  }, [estado, indice])

  function verificar() {
    if (!itemAtual || estado !== "a-perguntar") return
    const certa = verificarResposta(input, itemAtual.resposta)
    setTotalTentativas(t => t + 1)
    if (certa) {
      if (!erradosIds.has(itemAtual.id)) {
        setAcertosNaPrimeira(a => a + 1)
      }
      setEstado("certa")
    } else {
      setErradosIds(prev => new Set(prev).add(itemAtual.id))
      setEstado("errada")
    }
  }

  function avancar() {
    if (estado === "errada") {
      // Coloca item no fim da fila (deve tentar outra vez)
      const novaFila = [...fila]
      const item = novaFila.splice(indice, 1)[0]
      novaFila.push(item)
      setFila(novaFila)
      // indice não muda — agora aponta para o próximo
    } else if (estado === "certa") {
      // Remove da fila — já foi acertado
      const novaFila = [...fila]
      novaFila.splice(indice, 1)
      setFila(novaFila)
      // Se removemos o último item da fila: terminado
      if (novaFila.length === 0) {
        setConcluido(true)
        return
      }
      // indice pode ter ficado fora dos limites
      if (indice >= novaFila.length) setIndice(novaFila.length - 1)
    }
    setInput("")
    setEstado("a-perguntar")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (estado === "a-perguntar") verificar()
      else avancar()
    }
  }

  // ─── Ecrã sem itens ──────────────────────────────────────────────────────────
  if (totalOriginal === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhuma revisão hoje</h2>
          <p className="text-sm text-gray-500 mb-6">
            Faz a tua sessão de revisão primeiro e depois volta aqui para o Quiz do Dia.
          </p>
          <Link
            href="/vocabulario"
            className="block w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm text-center"
          >
            Ir para Revisão →
          </Link>
          <Link href="/" className="block mt-3 text-sm text-gray-400 hover:text-gray-600">
            ← Início
          </Link>
        </div>
      </div>
    )
  }

  // ─── Ecrã de conclusão ────────────────────────────────────────────────────────
  if (concluido) {
    const pct = totalOriginal > 0 ? Math.round((acertosNaPrimeira / totalOriginal) * 100) : 0
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "💪"
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">{emoji}</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Quiz concluído!</h2>
          <p className="text-sm text-gray-500 mb-6">Acertaste todas as palavras.</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{totalOriginal}</p>
              <p className="text-xs text-gray-400 mt-0.5">palavras</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{acertosNaPrimeira}</p>
              <p className="text-xs text-gray-400 mt-0.5">à 1ª</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-600">{pct}%</p>
              <p className="text-xs text-gray-400 mt-0.5">precisão</p>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm text-center"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  // ─── Ecrã de quiz ─────────────────────────────────────────────────────────────
  const restantes = fila.length
  const temArtigo = !!itemAtual?.artigo

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
          <h1 className="text-lg font-bold text-gray-800">Quiz do Dia</h1>
          <span className="text-sm text-gray-400">{restantes} restantes</span>
        </div>

        {/* Barra de progresso */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {itemAtual && (
          <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all ${
            estado === "certa" ? "border-green-300" :
            estado === "errada" ? "border-red-300" : "border-gray-100"
          }`}>

            {/* Nível + tipo */}
            <div className="flex items-center gap-2 mb-4">
              {itemAtual.nivel && <NivelBadge nivel={itemAtual.nivel} />}
              <span className="text-xs text-gray-400">
                {itemAtual.tipo === "verb" ? "verbo" : "vocabulário"}
              </span>
            </div>

            {/* Pergunta em português */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Como se diz em alemão?
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-1">{itemAtual.pergunta}</p>
            {temArtigo && estado === "a-perguntar" && (
              <p className="text-xs text-gray-400 mb-4">
                Inclui o artigo (der / die / das)
              </p>
            )}
            {!temArtigo && estado === "a-perguntar" && (
              <div className="mb-4" />
            )}

            {/* Input de resposta */}
            {estado === "a-perguntar" && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreve em alemão..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-400 focus:outline-none transition-colors"
                />
                <button
                  onClick={verificar}
                  disabled={!input.trim()}
                  className="mt-3 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-colors"
                >
                  Verificar
                </button>
              </>
            )}

            {/* Resposta certa */}
            {estado === "certa" && (
              <div className="mt-2">
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 mb-4">
                  <span className="text-green-600 text-xl">✓</span>
                  <p className="text-green-700 font-semibold">{itemAtual.resposta}</p>
                </div>
                <button
                  onClick={avancar}
                  autoFocus
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                >
                  Próximo →
                </button>
              </div>
            )}

            {/* Resposta errada */}
            {estado === "errada" && (
              <div className="mt-2">
                <div className="bg-red-50 rounded-xl px-4 py-3 mb-2">
                  <p className="text-xs text-red-400 mb-1">A tua resposta:</p>
                  <p className="text-red-700 font-medium line-through">{input}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Resposta correta:</p>
                  <p className="text-gray-800 font-bold text-lg">{itemAtual.resposta}</p>
                </div>
                <button
                  onClick={avancar}
                  autoFocus
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
                >
                  Tentar outra vez mais tarde
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contador de tentativas */}
        {totalTentativas > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            {acertosNaPrimeira} de {totalOriginal} acertadas à primeira · {totalTentativas} tentativas
          </p>
        )}
      </div>
    </div>
  )
}
