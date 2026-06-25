/**
 * Import vocabulary CSVs into the database.
 *
 * Usage:
 *   npx tsx scripts/import-vocab.ts
 *
 * Options:
 *   --clear   Delete all existing Words and Verbs before importing
 *   --words   Import only vocab-words.csv (or words-cefr.csv)
 *   --verbs   Import only vocab-verbs.csv (or verbs-cefr.csv)
 *   (no flag) Import both
 */

import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

const prisma = new PrismaClient()

// ─── CSV parser (handles quoted fields with commas) ─────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  const lines: string[] = []
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, "utf-8"),
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    if (line.trim()) lines.push(line)
  }

  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? "").trim()]))
  })
}

// ─── Level cache ─────────────────────────────────────────────────────────────

const levelCache = new Map<string, number>()

async function getOrCreateLevel(codigo: string): Promise<number> {
  if (levelCache.has(codigo)) return levelCache.get(codigo)!

  const nomes: Record<string, string> = {
    A1: "Principiante",
    A2: "Elementar",
    B1: "Intermédio",
    B2: "Intermédio Superior",
    C1: "Avançado",
    C2: "Proficiente",
  }

  const level = await prisma.level.upsert({
    where: { codigo },
    create: {
      codigo,
      nome: nomes[codigo] ?? codigo,
      descricao: `Nível CEFR ${codigo}`,
      ordem: ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(codigo),
    },
    update: {},
  })

  levelCache.set(codigo, level.id)
  return level.id
}

// ─── Module cache ─────────────────────────────────────────────────────────────

const moduleCache = new Map<string, number>()

async function getOrCreateModule(levelId: number, topic: string): Promise<number> {
  const key = `${levelId}::${topic}`
  if (moduleCache.has(key)) return moduleCache.get(key)!

  const existing = await prisma.module.findFirst({
    where: { levelId, tema: topic },
  })

  if (existing) {
    moduleCache.set(key, existing.id)
    return existing.id
  }

  const count = await prisma.module.count({ where: { levelId } })
  const mod = await prisma.module.create({
    data: {
      levelId,
      titulo: topic,
      tema: topic,
      ordem: count + 1,
    },
  })

  moduleCache.set(key, mod.id)
  return mod.id
}

// ─── Import words CSV ────────────────────────────────────────────────────────

async function importWords(filePath: string) {
  console.log(`\nImporting words from ${path.basename(filePath)}...`)
  const rows = await readCsv(filePath)
  console.log(`  ${rows.length} rows found`)

  let created = 0
  let skipped = 0

  for (const row of rows) {
    const level = row["level"]?.toUpperCase()
    const lemma = row["lemma"] || row["alemao"]
    const pos = row["pos"] || "palavra"
    const article = row["article"] || row["artigo"] || null
    const plural = row["plural"] || null
    const gender = row["gender"] || row["genero"] || null
    const translationPt = row["translation_pt"] || row["traducaoPt"]
    const exampleDe = row["example_de"] || row["exemplo"] || ""
    const examplePt = row["example_pt"] || row["exemploPt"] || null
    const topic = row["topic"] || row["tema"] || ""
    const diffNote = row["difficulty_note"] || row["raiz"] || ""

    if (!lemma || !translationPt || !level) {
      skipped++
      continue
    }

    // Skip verb POS — those belong in the verbs CSV
    if (pos === "verb") {
      skipped++
      continue
    }

    const existing = await prisma.word.findFirst({
      where: { alemao: lemma, tipo: pos },
    })

    if (existing) {
      skipped++
      continue
    }

    let moduleId: number | undefined
    if (topic) {
      const levelId = await getOrCreateLevel(level)
      moduleId = await getOrCreateModule(levelId, topic)
    }

    await prisma.word.create({
      data: {
        alemao: lemma,
        artigo: article || null,
        plural: plural || null,
        genero: gender || null,
        traducaoPt: translationPt,
        exemplo: exampleDe,
        exemploPt: examplePt || null,
        tema: topic,
        tipo: pos,
        raiz: diffNote,
        moduleId: moduleId ?? null,
      },
    })

    created++
    if (created % 50 === 0) process.stdout.write(".")
  }

  console.log(`\n  Created: ${created} | Skipped (duplicates/invalid): ${skipped}`)
}

// ─── Import verbs CSV ────────────────────────────────────────────────────────

async function importVerbs(filePath: string) {
  console.log(`\nImporting verbs from ${path.basename(filePath)}...`)
  const rows = await readCsv(filePath)
  console.log(`  ${rows.length} rows found`)

  let created = 0
  let skipped = 0

  for (const row of rows) {
    const level = row["level"]?.toUpperCase()
    const lemma = row["lemma"] || row["infinitivo"]
    const translationPt = row["translation_pt"] || row["traducaoPt"]
    const exampleDe = row["example_de"] || row["exemplo"] || ""
    const examplePt = row["example_pt"] || row["exemploPt"] || null
    const topic = row["topic"] || row["tema"] || ""
    const diffNote = row["difficulty_note"] || row["raiz"] || ""
    const separavel = row["separavel"] === "true"
    const irregular = row["irregular"] === "true"

    if (!lemma || !translationPt || !level) {
      skipped++
      continue
    }

    const existing = await prisma.verb.findFirst({
      where: { infinitivo: lemma },
    })

    if (existing) {
      skipped++
      continue
    }

    let moduleId: number | undefined
    if (topic) {
      const levelId = await getOrCreateLevel(level)
      moduleId = await getOrCreateModule(levelId, topic)
    }

    await prisma.verb.create({
      data: {
        infinitivo: lemma,
        traducaoPt: translationPt,
        exemplo: exampleDe,
        exemploPt: examplePt || null,
        raiz: diffNote,
        separavel,
        irregular,
        moduleId: moduleId ?? null,
      },
    })

    created++
    if (created % 50 === 0) process.stdout.write(".")
  }

  console.log(`\n  Created: ${created} | Skipped (duplicates/invalid): ${skipped}`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const clearFirst = args.includes("--clear")
  const onlyWords = args.includes("--words")
  const onlyVerbs = args.includes("--verbs")

  const dataDir = path.join(__dirname, "..", "prisma", "data")

  // Resolve file names — accept both naming conventions
  function findFile(...names: string[]): string | null {
    for (const name of names) {
      const p = path.join(dataDir, name)
      if (fs.existsSync(p)) return p
    }
    return null
  }

  const wordsFile = findFile("vocab-words.csv", "words-cefr.csv")
  const verbsFile = findFile("vocab-verbs.csv", "verbs-cefr.csv")

  if (clearFirst) {
    console.log("Clearing existing Words and Verbs...")
    await prisma.word.deleteMany()
    await prisma.verb.deleteMany()
    console.log("Done.")
  }

  try {
    if (!onlyVerbs && wordsFile) {
      await importWords(wordsFile)
    } else if (!onlyVerbs) {
      console.warn("Words CSV not found — skipping (expected vocab-words.csv or words-cefr.csv)")
    }

    if (!onlyWords && verbsFile) {
      await importVerbs(verbsFile)
    } else if (!onlyWords) {
      console.warn("Verbs CSV not found — skipping (expected vocab-verbs.csv or verbs-cefr.csv)")
    }

    const [totalWords, totalVerbs] = await Promise.all([
      prisma.word.count(),
      prisma.verb.count(),
    ])

    console.log(`\nImport complete!`)
    console.log(`  Total words in DB: ${totalWords}`)
    console.log(`  Total verbs in DB: ${totalVerbs}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
