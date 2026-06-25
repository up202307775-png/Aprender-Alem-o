// ─── Sequência de intervalos fixos em dias ───────────────────────────────────
// Dia 1 → 3 → 7 → 16 → 35 → 30 (mensal, repete indefinidamente)
export const INTERVALOS_DIAS = [1, 3, 7, 16, 35, 30] as const

// ─── Tipos ────────────────────────────────────────────────────────────────────

// Os quatro resultados possíveis que o utilizador pode dar a um item
export type Resultado = "errei" | "difícil" | "bom" | "fácil"

// Os campos do ReviewState que esta função atualiza (subconjunto do modelo Prisma)
export interface AtualizacaoRevisao {
  repeticoes: number     // nível atual na escada de intervalos
  intervaloDias: number  // intervalo em dias que foi calculado
  proximaRevisao: Date   // data da próxima revisão
  ultimaRevisao: Date    // data desta revisão
}

// ─── Funções auxiliares ───────────────────────────────────────────────────────

// Devolve o intervalo em dias para um número de repetições bem-sucedidas.
// Quando repeticoes >= 5, fica preso no último intervalo (30 dias, mensal).
export function getIntervalo(repeticoes: number): number {
  const indice = Math.min(repeticoes, INTERVALOS_DIAS.length - 1)
  return INTERVALOS_DIAS[indice]
}

// Cria uma nova Date adicionando `dias` dias à data fornecida.
// Não muta o argumento original.
function adicionarDias(data: Date, dias: number): Date {
  const copia = new Date(data)
  copia.setDate(copia.getDate() + dias)
  return copia
}

// ─── Algoritmo principal ──────────────────────────────────────────────────────

// Recebe o número de repetições bem-sucedidas atuais e o resultado do utilizador,
// e devolve os novos valores a gravar no ReviewState.
//
// Regras:
//   errei   → volta ao nível 0, revisão amanhã
//   difícil → mantém o nível atual, repete no mesmo intervalo
//   bom     → avança um nível
//   fácil   → salta dois níveis (item bem consolidado)
export function calcularProximaRevisao(
  repeticoesAtuais: number,
  resultado: Resultado
): AtualizacaoRevisao {
  const agora = new Date()

  switch (resultado) {
    case "errei": {
      // Item falhado: recomeça do nível 0 → intervalo de 1 dia
      return {
        repeticoes: 0,
        intervaloDias: 1,
        proximaRevisao: adicionarDias(agora, 1),
        ultimaRevisao: agora,
      }
    }

    case "difícil": {
      // Item difícil: não sobe de nível, repete no intervalo atual
      const intervalo = getIntervalo(repeticoesAtuais)
      return {
        repeticoes: repeticoesAtuais,
        intervaloDias: intervalo,
        proximaRevisao: adicionarDias(agora, intervalo),
        ultimaRevisao: agora,
      }
    }

    case "bom": {
      // Item bem sabido: avança um nível na escada de intervalos
      const novasReps = repeticoesAtuais + 1
      const intervalo = getIntervalo(novasReps)
      return {
        repeticoes: novasReps,
        intervaloDias: intervalo,
        proximaRevisao: adicionarDias(agora, intervalo),
        ultimaRevisao: agora,
      }
    }

    case "fácil": {
      // Item muito fácil: salta dois níveis (acelera o espaçamento)
      const novasReps = repeticoesAtuais + 2
      const intervalo = getIntervalo(novasReps)
      return {
        repeticoes: novasReps,
        intervaloDias: intervalo,
        proximaRevisao: adicionarDias(agora, intervalo),
        ultimaRevisao: agora,
      }
    }
  }
}
