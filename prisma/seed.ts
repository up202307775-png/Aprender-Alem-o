import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function conj(prasens: Record<string, string>, prateritum: Record<string, string>, perfekt: string) {
  return JSON.stringify({ prasens, prateritum, perfekt });
}

async function main() {
  // ─── Limpar base de dados (ordem inversa de FK) ──────────────────────────
  await prisma.userState.deleteMany();
  await prisma.score.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.reviewState.deleteMany();
  await prisma.externalExercise.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.word.deleteMany();
  await prisma.verb.deleteMany();
  await prisma.grammarModule.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.module.deleteMany();
  await prisma.level.deleteMany();

  // ─── Níveis CEFR ─────────────────────────────────────────────────────────
  const a1 = await prisma.level.create({ data: { codigo: "A1", nome: "Iniciante", descricao: "Comunicação básica: apresentações, números, rotina diária.", ordem: 1 } });
  const a2 = await prisma.level.create({ data: { codigo: "A2", nome: "Elementar", descricao: "Situações quotidianas: compras, saúde, passado simples.", ordem: 2 } });
  const b1 = await prisma.level.create({ data: { codigo: "B1", nome: "Intermédio", descricao: "Temas familiares: viagens, trabalho, experiências passadas.", ordem: 3 } });
  const b2 = await prisma.level.create({ data: { codigo: "B2", nome: "Intermédio Superior", descricao: "Debate de ideias abstratas com fluência e espontaneidade.", ordem: 4 } });
  const c1 = await prisma.level.create({ data: { codigo: "C1", nome: "Avançado", descricao: "Textos complexos, registo formal e expressão espontânea.", ordem: 5 } });
  const c2 = await prisma.level.create({ data: { codigo: "C2", nome: "Proficiente", descricao: "Domínio próximo do nativo em qualquer contexto.", ordem: 6 } });

  // ═══════════════════════════════════════════════════════════════════════════
  // A1 — 7 módulos com conteúdo completo
  // ═══════════════════════════════════════════════════════════════════════════

  // ── A1 M1: Identidade pessoal ────────────────────────────────────────────
  const a1m1 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Identidade pessoal", tema: "identidade", ordem: 1 } });

  await prisma.word.createMany({ data: [
    { alemao: "der Name", artigo: "der", genero: "masc", raiz: "Do latim nomen", traducaoPt: "o nome", plural: "die Namen", exemplo: "Mein Name ist Thomas.", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "das Alter", artigo: "das", genero: "neutro", raiz: "Do alto-alemão alto altar", traducaoPt: "a idade", plural: "", exemplo: "Mein Alter ist 25 Jahre.", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "das Land", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *landą", traducaoPt: "o país / a terra", plural: "die Länder", exemplo: "Aus welchem Land kommst du?", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "die Sprache", artigo: "die", genero: "fem", raiz: "De sprechen (falar)", traducaoPt: "a língua / o idioma", plural: "die Sprachen", exemplo: "Ich lerne die deutsche Sprache.", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "der Beruf", artigo: "der", genero: "masc", raiz: "De rufen (chamar): 'vocação'", traducaoPt: "a profissão", plural: "die Berufe", exemplo: "Was ist dein Beruf?", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "die Adresse", artigo: "die", genero: "fem", raiz: "Do francês adresse", traducaoPt: "a morada", plural: "die Adressen", exemplo: "Was ist deine Adresse?", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "die Telefonnummer", artigo: "die", genero: "fem", raiz: "Telefon + Nummer", traducaoPt: "o número de telefone", plural: "die Telefonnummern", exemplo: "Wie ist deine Telefonnummer?", tema: "identidade", tipo: "palavra", moduleId: a1m1.id },
    { alemao: "Wie heißt du?", artigo: "", genero: "—", raiz: "Wie (como) + heißen (chamar-se)", traducaoPt: "Como te chamas?", plural: "", exemplo: "Wie heißt du? — Ich heiße Anna.", tema: "identidade", tipo: "chunk", moduleId: a1m1.id },
    { alemao: "Ich komme aus...", artigo: "", genero: "—", raiz: "kommen (vir) + aus (de)", traducaoPt: "Sou de... / Venho de...", plural: "", exemplo: "Ich komme aus Portugal.", tema: "identidade", tipo: "chunk", moduleId: a1m1.id },
    { alemao: "Guten Morgen", artigo: "", genero: "—", raiz: "Gut (bom) + Morgen (manhã)", traducaoPt: "Bom dia (de manhã)", plural: "", exemplo: "Guten Morgen! Wie geht es Ihnen?", tema: "saudações", tipo: "chunk", moduleId: a1m1.id },
    { alemao: "Auf Wiedersehen", artigo: "", genero: "—", raiz: "Auf (até) + wieder (de novo) + sehen (ver)", traducaoPt: "Adeus (formal)", plural: "", exemplo: "Auf Wiedersehen und gute Reise!", tema: "saudações", tipo: "chunk", moduleId: a1m1.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "heißen", traducaoPt: "chamar-se", raiz: "heiß-", separavel: false, irregular: true, moduleId: a1m1.id,
      conjugacoes: conj({ ich: "heiße", du: "heißt", er: "heißt", wir: "heißen", ihr: "heißt", sie: "heißen" }, { ich: "hieß", du: "hießt", er: "hieß", wir: "hießen", ihr: "hießt", sie: "hießen" }, "hat geheißen") },
    { infinitivo: "sein", traducaoPt: "ser / estar", raiz: "sei-", separavel: false, irregular: true, moduleId: a1m1.id,
      conjugacoes: conj({ ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" }, { ich: "war", du: "warst", er: "war", wir: "waren", ihr: "wart", sie: "waren" }, "ist gewesen") },
    { infinitivo: "haben", traducaoPt: "ter", raiz: "hab-", separavel: false, irregular: true, moduleId: a1m1.id,
      conjugacoes: conj({ ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" }, { ich: "hatte", du: "hattest", er: "hatte", wir: "hatten", ihr: "hattet", sie: "hatten" }, "hat gehabt") },
    { infinitivo: "kommen", traducaoPt: "vir / chegar", raiz: "komm-", separavel: false, irregular: true, moduleId: a1m1.id,
      conjugacoes: conj({ ich: "komme", du: "kommst", er: "kommt", wir: "kommen", ihr: "kommt", sie: "kommen" }, { ich: "kam", du: "kamst", er: "kam", wir: "kamen", ihr: "kamt", sie: "kamen" }, "ist gekommen") },
  ]});

  await prisma.grammarModule.createMany({ data: [
    {
      titulo: "Pronomes Pessoais e sein/haben", moduleId: a1m1.id,
      conteudo: `# Pronomes Pessoais e sein/haben

## Pronomes pessoais (sujeito)

| Pessoa | Alemão | Português |
|--------|--------|-----------|
| 1ª sing. | **ich** | eu |
| 2ª sing. | **du** | tu |
| 3ª sing. | **er / sie / es** | ele / ela / isso |
| 1ª pl. | **wir** | nós |
| 2ª pl. | **ihr** | vós / vocês |
| 3ª pl. / formal | **sie / Sie** | eles / você(s) |

## sein — ser/estar

| ich | du | er/sie/es | wir | ihr | sie |
|-----|----|-----------|-----|-----|-----|
| bin | bist | ist | sind | seid | sind |

## haben — ter

| ich | du | er/sie/es | wir | ihr | sie |
|-----|----|-----------|-----|-----|-----|
| habe | hast | hat | haben | habt | haben |`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "preenchimento", pergunta: "Preenche: Ich ___ Schüler. (sein)", resposta: "bin", explicacao: "1ª pessoa singular de sein é 'bin'." },
        { id: 2, tipo: "escolha-multipla", pergunta: "Como se diz 'Ela tem um gato'?", opcoes: ["Sie hat eine Katze.", "Sie haben eine Katze.", "Sie hast eine Katze."], resposta: "Sie hat eine Katze.", explicacao: "3ª pessoa singular de haben é 'hat'." },
        { id: 3, tipo: "preenchimento", pergunta: "Preenche: Wir ___ Studenten. (sein)", resposta: "sind", explicacao: "1ª pessoa plural de sein é 'sind'." },
      ]),
    },
    {
      titulo: "Perguntas W-Fragen", moduleId: a1m1.id,
      conteudo: `# W-Fragen — As Perguntas com W

As perguntas de informação em alemão começam quase todas com W:

| Palavra | Significado | Exemplo |
|---------|-------------|---------|
| **Wer?** | Quem? | Wer bist du? |
| **Was?** | O quê? | Was machst du? |
| **Wo?** | Onde? | Wo wohnst du? |
| **Woher?** | De onde? | Woher kommst du? |
| **Wohin?** | Para onde? | Wohin gehst du? |
| **Wie?** | Como? | Wie heißt du? |
| **Wann?** | Quando? | Wann kommst du? |
| **Warum?** | Porquê? | Warum lernst du Deutsch? |
| **Wie viel?** | Quanto? | Wie viel kostet das? |

## Estrutura da pergunta

**W-Wort + Verb + Subjekt + ...**

> Wo **wohnst** du? (Onde moras?)`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "escolha-multipla", pergunta: "Como se pergunta 'De onde és?'", opcoes: ["Wo kommst du?", "Woher kommst du?", "Wohin kommst du?"], resposta: "Woher kommst du?", explicacao: "'Woher' indica origem." },
        { id: 2, tipo: "preenchimento", pergunta: "___ heißt du? (Como te chamas?)", resposta: "Wie", explicacao: "'Wie' pergunta sobre modo ou nome." },
      ]),
    },
    {
      titulo: "Artigos Definidos e Indefinidos", moduleId: a1m1.id,
      conteudo: `# Artigos em Alemão

## Artigos definidos (o/a)

| Género | Artigo | Exemplo |
|--------|--------|---------|
| Masculino | **der** | der Mann |
| Feminino | **die** | die Frau |
| Neutro | **das** | das Kind |
| Plural | **die** | die Kinder |

## Artigos indefinidos (um/uma)

| Género | Artigo | Exemplo |
|--------|--------|---------|
| Masculino | **ein** | ein Mann |
| Feminino | **eine** | eine Frau |
| Neutro | **ein** | ein Kind |

## Dicas de género por sufixo

- **-ung** → sempre feminino: die Rechnung, die Wohnung
- **-heit / -keit** → sempre feminino: die Freiheit
- **-chen / -lein** → sempre neutro: das Mädchen
- **-er** (agente) → geralmente masculino: der Lehrer`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "escolha-multipla", pergunta: "Qual é o artigo de 'Buch' (livro)?", opcoes: ["der Buch", "die Buch", "das Buch"], resposta: "das Buch", explicacao: "Buch é neutro." },
        { id: 2, tipo: "escolha-multipla", pergunta: "A palavra 'Wohnung' (apartamento) é...", opcoes: ["der Wohnung", "die Wohnung", "das Wohnung"], resposta: "die Wohnung", explicacao: "Todas as palavras em -ung são femininas." },
      ]),
    },
  ]});

  // ── A1 M2: Família e relações ─────────────────────────────────────────────
  const a1m2 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Família e relações", tema: "família", ordem: 2 } });

  await prisma.word.createMany({ data: [
    { alemao: "die Familie", artigo: "die", genero: "fem", raiz: "Do latim familia", traducaoPt: "a família", plural: "die Familien", exemplo: "Meine Familie ist groß.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "die Mutter", artigo: "die", genero: "fem", raiz: "Do proto-germânico *mōdēr", traducaoPt: "a mãe", plural: "die Mütter", exemplo: "Meine Mutter heißt Maria.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "der Vater", artigo: "der", genero: "masc", raiz: "Do proto-germânico *fadēr", traducaoPt: "o pai", plural: "die Väter", exemplo: "Mein Vater arbeitet viel.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "der Bruder", artigo: "der", genero: "masc", raiz: "Do proto-germânico *brōþēr", traducaoPt: "o irmão", plural: "die Brüder", exemplo: "Mein Bruder ist 20 Jahre alt.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "die Schwester", artigo: "die", genero: "fem", raiz: "Do proto-germânico *swestar", traducaoPt: "a irmã", plural: "die Schwestern", exemplo: "Ich habe zwei Schwestern.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "der Mann", artigo: "der", genero: "masc", raiz: "Do proto-germânico *mannaz", traducaoPt: "o homem / o marido", plural: "die Männer", exemplo: "Der Mann liest ein Buch.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "die Frau", artigo: "die", genero: "fem", raiz: "Do proto-germânico *frawjō", traducaoPt: "a mulher / a esposa", plural: "die Frauen", exemplo: "Meine Frau heißt Lisa.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "das Kind", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *kindą", traducaoPt: "a criança", plural: "die Kinder", exemplo: "Das Kind spielt im Garten.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "der Freund", artigo: "der", genero: "masc", raiz: "Do proto-germânico *frijōndz", traducaoPt: "o amigo / o namorado", plural: "die Freunde", exemplo: "Mein Freund heißt Thomas.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
    { alemao: "die Freundin", artigo: "die", genero: "fem", raiz: "Feminino de Freund + sufixo -in", traducaoPt: "a amiga / a namorada", plural: "die Freundinnen", exemplo: "Meine Freundin kommt morgen.", tema: "família", tipo: "palavra", moduleId: a1m2.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "wohnen", traducaoPt: "morar / habitar", raiz: "wohn-", separavel: false, irregular: false, moduleId: a1m2.id,
      conjugacoes: conj({ ich: "wohne", du: "wohnst", er: "wohnt", wir: "wohnen", ihr: "wohnt", sie: "wohnen" }, { ich: "wohnte", du: "wohntest", er: "wohnte", wir: "wohnten", ihr: "wohntet", sie: "wohnten" }, "hat gewohnt") },
    { infinitivo: "leben", traducaoPt: "viver", raiz: "leb-", separavel: false, irregular: false, moduleId: a1m2.id,
      conjugacoes: conj({ ich: "lebe", du: "lebst", er: "lebt", wir: "leben", ihr: "lebt", sie: "leben" }, { ich: "lebte", du: "lebtest", er: "lebte", wir: "lebten", ihr: "lebtet", sie: "lebten" }, "hat gelebt") },
    { infinitivo: "lernen", traducaoPt: "aprender / estudar", raiz: "lern-", separavel: false, irregular: false, moduleId: a1m2.id,
      conjugacoes: conj({ ich: "lerne", du: "lernst", er: "lernt", wir: "lernen", ihr: "lernt", sie: "lernen" }, { ich: "lernte", du: "lerntest", er: "lernte", wir: "lernten", ihr: "lerntet", sie: "lernten" }, "hat gelernt") },
  ]});

  await prisma.grammarModule.createMany({ data: [
    {
      titulo: "O Presente (Präsens)", moduleId: a1m2.id,
      conteudo: `# O Präsens — Presente do Indicativo

O presente alemão serve para ações habituais e em curso.

## Verbos regulares — terminações

| Pessoa | Terminação | machen |
|--------|-----------|--------|
| ich | **-e** | mach**e** |
| du | **-st** | mach**st** |
| er/sie/es | **-t** | mach**t** |
| wir | **-en** | mach**en** |
| ihr | **-t** | mach**t** |
| sie/Sie | **-en** | mach**en** |

## Verbos com vogal de ligação (-e-)

Verbos cujo radical termina em **-t, -d, -n, -m** acrescentam -e- antes das terminações:

- arbeit**en**: du arbeit**e**st, er arbeit**e**t
- red**en**: du red**e**st, er red**e**t

## Mudança vocálica (verbos irregulares)

Alguns verbos fortes mudam e→i ou a→ä nas 2ª/3ª pessoas:

| Verbo | du | er |
|-------|----|----|
| sprechen | **sprichst** | **spricht** |
| essen | **isst** | **isst** |
| fahren | **fährst** | **fährt** |`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "preenchimento", pergunta: "Conjuga 'lernen' para 'du': Du ___ Deutsch.", resposta: "lernst", explicacao: "Radical lern- + terminação -st = lernst." },
        { id: 2, tipo: "preenchimento", pergunta: "Conjuga 'arbeiten' para 'er': Er ___ viel.", resposta: "arbeitet", explicacao: "Radical arbeit- termina em -t, por isso acrescenta -et." },
        { id: 3, tipo: "escolha-multipla", pergunta: "Qual está correto?", opcoes: ["Ich lerne Deutsch.", "Ich lernt Deutsch.", "Ich lernes Deutsch."], resposta: "Ich lerne Deutsch.", explicacao: "1ª pessoa singular: radical + -e." },
      ]),
    },
  ]});

  // ── A1 M3: Casa e habitação ───────────────────────────────────────────────
  const a1m3 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Casa e habitação", tema: "casa", ordem: 3 } });

  await prisma.word.createMany({ data: [
    { alemao: "das Haus", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *hūsan", traducaoPt: "a casa", plural: "die Häuser", exemplo: "Das Haus ist sehr groß.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "die Wohnung", artigo: "die", genero: "fem", raiz: "De wohnen (morar) + -ung", traducaoPt: "o apartamento", plural: "die Wohnungen", exemplo: "Meine Wohnung hat drei Zimmer.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "das Zimmer", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *timbran", traducaoPt: "o quarto / o compartimento", plural: "die Zimmer", exemplo: "Das Zimmer hat eine schöne Aussicht.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "die Küche", artigo: "die", genero: "fem", raiz: "Do latim coquina", traducaoPt: "a cozinha", plural: "die Küchen", exemplo: "Ich koche in der Küche.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "das Badezimmer", artigo: "das", genero: "neutro", raiz: "Bad (banho) + Zimmer (quarto)", traducaoPt: "a casa de banho", plural: "die Badezimmer", exemplo: "Das Badezimmer ist links.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "das Wohnzimmer", artigo: "das", genero: "neutro", raiz: "Wohn- (habitar) + Zimmer", traducaoPt: "a sala de estar", plural: "die Wohnzimmer", exemplo: "Wir sitzen im Wohnzimmer.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "die Tür", artigo: "die", genero: "fem", raiz: "Do proto-germânico *durz", traducaoPt: "a porta", plural: "die Türen", exemplo: "Bitte mach die Tür zu!", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "das Fenster", artigo: "das", genero: "neutro", raiz: "Do latim fenestra", traducaoPt: "a janela", plural: "die Fenster", exemplo: "Das Fenster ist offen.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "der Tisch", artigo: "der", genero: "masc", raiz: "Do latim discus", traducaoPt: "a mesa", plural: "die Tische", exemplo: "Das Buch liegt auf dem Tisch.", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
    { alemao: "der Stuhl", artigo: "der", genero: "masc", raiz: "Do proto-germânico *stōlaz", traducaoPt: "a cadeira", plural: "die Stühle", exemplo: "Setz dich auf den Stuhl!", tema: "casa", tipo: "palavra", moduleId: a1m3.id },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Preposições de Lugar", moduleId: a1m3.id,
    conteudo: `# Preposições de Lugar

## Preposições com Dativo (posição estática)

Usadas com **sein, liegen, stehen, hängen** (estado):

| Preposição | Significado | Exemplo |
|-----------|-------------|---------|
| **in** + Dat. | dentro de | Das Buch ist **im** Regal. |
| **auf** + Dat. | em cima de | Die Katze ist **auf** dem Tisch. |
| **unter** + Dat. | debaixo de | Die Tasche ist **unter** dem Stuhl. |
| **über** + Dat. | por cima de | Das Bild hängt **über** dem Sofa. |
| **neben** + Dat. | ao lado de | Das Fenster ist **neben** der Tür. |
| **vor** + Dat. | à frente de | Der Hund sitzt **vor** dem Haus. |
| **hinter** + Dat. | atrás de | Die Katze ist **hinter** dem Sofa. |
| **zwischen** + Dat. | entre | Der Tisch ist **zwischen** den Stühlen. |

## Contrações comuns

- in + dem = **im** (im Zimmer)
- an + dem = **am** (am Tisch)
- auf + dem = **auf dem** (sem contração habitual)`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "escolha-multipla", pergunta: "Das Buch ist ___ Tisch. (em cima da mesa)", opcoes: ["auf dem", "in dem", "unter dem"], resposta: "auf dem", explicacao: "'Auf' indica superfície, com dativo." },
      { id: 2, tipo: "preenchimento", pergunta: "Die Katze ist ___ Sofa. (atrás do sofá)", resposta: "hinter dem", explicacao: "'Hinter' + dativo indica posição atrás de algo." },
    ]),
  }});

  // ── A1 M4: Comida e bebida ────────────────────────────────────────────────
  const a1m4 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Comida e bebida", tema: "comida", ordem: 4 } });

  await prisma.word.createMany({ data: [
    { alemao: "das Wasser", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *watōr", traducaoPt: "a água", plural: "die Wässer", exemplo: "Ich trinke ein Glas Wasser.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "der Kaffee", artigo: "der", genero: "masc", raiz: "Do árabe qahwa via turco", traducaoPt: "o café", plural: "die Kaffees", exemplo: "Einen Kaffee, bitte!", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "der Tee", artigo: "der", genero: "masc", raiz: "Do chinês chá via malaio teh", traducaoPt: "o chá", plural: "die Tees", exemplo: "Ich möchte einen Tee.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "das Brot", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *braudą", traducaoPt: "o pão", plural: "die Brote", exemplo: "Ich esse Brot zum Frühstück.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "die Butter", artigo: "die", genero: "fem", raiz: "Do latim butyrum", traducaoPt: "a manteiga", plural: "", exemplo: "Ich esse Brot mit Butter.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "das Fleisch", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *flaiski", traducaoPt: "a carne", plural: "", exemplo: "Ich esse gern Fleisch.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "der Fisch", artigo: "der", genero: "masc", raiz: "Do proto-germânico *fiskaz", traducaoPt: "o peixe", plural: "die Fische", exemplo: "Der Fisch ist sehr frisch.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "das Gemüse", artigo: "das", genero: "neutro", raiz: "Ge- + Mus (papas/purê)", traducaoPt: "os legumes", plural: "", exemplo: "Gemüse ist gesund.", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "die Speisekarte", artigo: "die", genero: "fem", raiz: "Speise (comida) + Karte (carta)", traducaoPt: "a ementa / o menu", plural: "die Speisekarten", exemplo: "Kann ich die Speisekarte haben?", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
    { alemao: "die Rechnung", artigo: "die", genero: "fem", raiz: "De rechnen (calcular)", traducaoPt: "a conta / a fatura", plural: "die Rechnungen", exemplo: "Die Rechnung, bitte!", tema: "comida", tipo: "palavra", moduleId: a1m4.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "essen", traducaoPt: "comer", raiz: "ess-", separavel: false, irregular: true, moduleId: a1m4.id,
      conjugacoes: conj({ ich: "esse", du: "isst", er: "isst", wir: "essen", ihr: "esst", sie: "essen" }, { ich: "aß", du: "aßt", er: "aß", wir: "aßen", ihr: "aßt", sie: "aßen" }, "hat gegessen") },
    { infinitivo: "trinken", traducaoPt: "beber", raiz: "trink-", separavel: false, irregular: true, moduleId: a1m4.id,
      conjugacoes: conj({ ich: "trinke", du: "trinkst", er: "trinkt", wir: "trinken", ihr: "trinkt", sie: "trinken" }, { ich: "trank", du: "trankst", er: "trank", wir: "tranken", ihr: "trankt", sie: "tranken" }, "hat getrunken") },
    { infinitivo: "mögen", traducaoPt: "gostar de", raiz: "mög-", separavel: false, irregular: true, moduleId: a1m4.id,
      conjugacoes: conj({ ich: "mag", du: "magst", er: "mag", wir: "mögen", ihr: "mögt", sie: "mögen" }, { ich: "mochte", du: "mochtest", er: "mochte", wir: "mochten", ihr: "mochtet", sie: "mochten" }, "hat gemocht") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Plural dos Substantivos", moduleId: a1m4.id,
    conteudo: `# O Plural em Alemão

Em alemão não há uma regra única para o plural — cada substantivo tem o seu plural. Há 5 padrões principais:

## Padrão 1 — sem alteração (muitos neutros em -er, -en, -el)
- das Zimmer → die Zimmer
- das Fenster → die Fenster

## Padrão 2 — acrescenta -e (muitos masculinos e neutros)
- der Tag → die Tag**e**
- das Brot → die Brot**e**

## Padrão 3 — acrescenta -e + Umlaut (masculinos com a/o/u)
- der Mann → die M**ä**nn**er**
- das Haus → die H**ä**us**er**

## Padrão 4 — acrescenta -(e)n (muitos femininos)
- die Frau → die Frau**en**
- die Wohnung → die Wohnung**en**

## Padrão 5 — acrescenta -s (palavras estrangeiras)
- das Hotel → die Hotel**s**
- das Foto → die Foto**s**

**Dica:** Aprende sempre o plural junto com o artigo: *die Frau — die Frauen*.`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "preenchimento", pergunta: "Qual é o plural de 'das Kind'?", resposta: "die Kinder", explicacao: "Kind segue o padrão 3: Kinder (com -er)." },
      { id: 2, tipo: "preenchimento", pergunta: "Qual é o plural de 'die Wohnung'?", resposta: "die Wohnungen", explicacao: "Femininos em -ung acrescentam -en." },
      { id: 3, tipo: "escolha-multipla", pergunta: "Qual é o plural de 'das Hotel'?", opcoes: ["die Hotele", "die Hotels", "die Hotelern"], resposta: "die Hotels", explicacao: "Palavras estrangeiras normalmente acrescentam -s." },
    ]),
  }});

  // ── A1 M5: Negação ────────────────────────────────────────────────────────
  const a1m5 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Negação e números", tema: "negação", ordem: 5 } });

  await prisma.word.createMany({ data: [
    { alemao: "nicht", artigo: "", genero: "—", raiz: "Do proto-germânico *ne + wiht", traducaoPt: "não (nega verbo/adj)", plural: "", exemplo: "Ich verstehe das nicht.", tema: "negação", tipo: "palavra", moduleId: a1m5.id },
    { alemao: "kein / keine", artigo: "", genero: "—", raiz: "De kein, negação de 'ein'", traducaoPt: "nenhum/a (nega substantivo)", plural: "", exemplo: "Ich habe kein Geld.", tema: "negação", tipo: "palavra", moduleId: a1m5.id },
    { alemao: "nein", artigo: "", genero: "—", raiz: "Do proto-germânico *ne + ainaz", traducaoPt: "não (resposta)", plural: "", exemplo: "Nein, ich komme nicht.", tema: "negação", tipo: "palavra", moduleId: a1m5.id },
    { alemao: "eins / zwei / drei", artigo: "", genero: "—", raiz: "Numerais proto-germânicos", traducaoPt: "um / dois / três", plural: "", exemplo: "Ich habe zwei Kinder.", tema: "números", tipo: "chunk", moduleId: a1m5.id },
    { alemao: "zehn / zwanzig / hundert", artigo: "", genero: "—", raiz: "Numerais proto-germânicos", traducaoPt: "dez / vinte / cem", plural: "", exemplo: "Das kostet zwanzig Euro.", tema: "números", tipo: "chunk", moduleId: a1m5.id },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Negação: nicht e kein", moduleId: a1m5.id,
    conteudo: `# Negação em Alemão

## nicht — nega verbos, adjetivos e advérbios

**nicht** vem geralmente no fim da frase, ou antes do elemento que nega:

- Ich komme **nicht**. (Não venho.)
- Das ist **nicht** gut. (Isso não é bom.)
- Er wohnt **nicht** hier. (Ele não mora aqui.)

## kein/keine — nega substantivos com artigo indefinido ou sem artigo

Usa-se **kein** onde usarias **ein** na afirmativa:

| Género | Afirmativa | Negativa |
|--------|-----------|---------|
| Masc. | Ich habe **einen** Hund. | Ich habe **keinen** Hund. |
| Fem. | Ich habe **eine** Katze. | Ich habe **keine** Katze. |
| Neutro | Ich habe **ein** Auto. | Ich habe **kein** Auto. |
| Plural | Ich habe **—** Kinder. | Ich habe **keine** Kinder. |

## Quando usar nicht vs kein?

- Substantivo com artigo indefinido ou zero → **kein**
- Tudo o resto → **nicht**`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "escolha-multipla", pergunta: "Ich habe ___ Zeit. (Não tenho tempo)", opcoes: ["nicht", "keine", "kein"], resposta: "keine", explicacao: "Zeit é feminino com artigo zero → kein + fem. = keine." },
      { id: 2, tipo: "preenchimento", pergunta: "Das ist ___ mein Buch. (Esse não é o meu livro.)", resposta: "nicht", explicacao: "Nega o pronome possessivo — usa nicht." },
      { id: 3, tipo: "escolha-multipla", pergunta: "Er ist ___ müde. (Ele não está cansado.)", opcoes: ["kein", "keine", "nicht"], resposta: "nicht", explicacao: "Nega o adjetivo predicativo — usa nicht." },
    ]),
  }});

  // ── A1 M6: Cidade e transportes ───────────────────────────────────────────
  const a1m6 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Cidade e transportes", tema: "cidade", ordem: 6 } });

  await prisma.word.createMany({ data: [
    { alemao: "die Stadt", artigo: "die", genero: "fem", raiz: "Do proto-germânico *stadiz", traducaoPt: "a cidade", plural: "die Städte", exemplo: "Berlin ist eine große Stadt.", tema: "cidade", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "der Bahnhof", artigo: "der", genero: "masc", raiz: "Bahn (caminho) + Hof (pátio)", traducaoPt: "a estação de comboios", plural: "die Bahnhöfe", exemplo: "Der Bahnhof ist in der Mitte.", tema: "cidade", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "die Straße", artigo: "die", genero: "fem", raiz: "Do latim strata (via calcetada)", traducaoPt: "a rua", plural: "die Straßen", exemplo: "Ich wohne in der Hauptstraße.", tema: "cidade", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "der Bus", artigo: "der", genero: "masc", raiz: "Abreviatura de Omnibus", traducaoPt: "o autocarro", plural: "die Busse", exemplo: "Ich fahre mit dem Bus.", tema: "transportes", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "die U-Bahn", artigo: "die", genero: "fem", raiz: "Untergrund (subterrâneo) + Bahn", traducaoPt: "o metro", plural: "die U-Bahnen", exemplo: "Die U-Bahn fährt alle 5 Minuten.", tema: "transportes", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "das Auto", artigo: "das", genero: "neutro", raiz: "Abreviatura de Automobil", traducaoPt: "o carro", plural: "die Autos", exemplo: "Mein Auto ist blau.", tema: "transportes", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "das Fahrrad", artigo: "das", genero: "neutro", raiz: "Fahr- (andar) + Rad (roda)", traducaoPt: "a bicicleta", plural: "die Fahrräder", exemplo: "Ich fahre jeden Tag mit dem Fahrrad.", tema: "transportes", tipo: "palavra", moduleId: a1m6.id },
    { alemao: "links / rechts / geradeaus", artigo: "", genero: "—", raiz: "Advérbios de direção", traducaoPt: "à esquerda / à direita / em frente", plural: "", exemplo: "Gehen Sie geradeaus, dann links.", tema: "cidade", tipo: "chunk", moduleId: a1m6.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "fahren", traducaoPt: "andar de veículo / conduzir", raiz: "fahr-", separavel: false, irregular: true, moduleId: a1m6.id,
      conjugacoes: conj({ ich: "fahre", du: "fährst", er: "fährt", wir: "fahren", ihr: "fahrt", sie: "fahren" }, { ich: "fuhr", du: "fuhrst", er: "fuhr", wir: "fuhren", ihr: "fuhrt", sie: "fuhren" }, "ist gefahren") },
    { infinitivo: "gehen", traducaoPt: "ir / andar a pé", raiz: "geh-", separavel: false, irregular: true, moduleId: a1m6.id,
      conjugacoes: conj({ ich: "gehe", du: "gehst", er: "geht", wir: "gehen", ihr: "geht", sie: "gehen" }, { ich: "ging", du: "gingst", er: "ging", wir: "gingen", ihr: "gingt", sie: "gingen" }, "ist gegangen") },
  ]});

  // ── A1 M7: Rotina diária ──────────────────────────────────────────────────
  const a1m7 = await prisma.module.create({ data: { levelId: a1.id, titulo: "Rotina diária", tema: "rotina", ordem: 7 } });

  await prisma.word.createMany({ data: [
    { alemao: "der Tag", artigo: "der", genero: "masc", raiz: "Do proto-germânico *dagaz", traducaoPt: "o dia", plural: "die Tage", exemplo: "Heute ist ein schöner Tag.", tema: "tempo", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "die Woche", artigo: "die", genero: "fem", raiz: "Do alto-alemão antigo *wohha", traducaoPt: "a semana", plural: "die Wochen", exemplo: "Diese Woche lerne ich Deutsch.", tema: "tempo", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "der Morgen", artigo: "der", genero: "masc", raiz: "Do proto-germânico *murganaz", traducaoPt: "a manhã", plural: "die Morgen", exemplo: "Am Morgen trinke ich Kaffee.", tema: "rotina", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "der Abend", artigo: "der", genero: "masc", raiz: "Do proto-germânico *abanaz", traducaoPt: "a tarde/noite", plural: "die Abende", exemplo: "Am Abend lese ich ein Buch.", tema: "rotina", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "die Arbeit", artigo: "die", genero: "fem", raiz: "Do proto-germânico *arbaidiz", traducaoPt: "o trabalho", plural: "die Arbeiten", exemplo: "Die Arbeit beginnt um 9 Uhr.", tema: "trabalho", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "die Schule", artigo: "die", genero: "fem", raiz: "Do latim schola", traducaoPt: "a escola", plural: "die Schulen", exemplo: "Die Kinder gehen zur Schule.", tema: "escola", tipo: "palavra", moduleId: a1m7.id },
    { alemao: "um ... Uhr", artigo: "", genero: "—", raiz: "Um (preposição de hora) + Uhr (relógio)", traducaoPt: "às ... horas", plural: "", exemplo: "Der Zug fährt um 8 Uhr ab.", tema: "rotina", tipo: "chunk", moduleId: a1m7.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "aufstehen", traducaoPt: "levantar-se", raiz: "steh-", separavel: true, irregular: true, moduleId: a1m7.id,
      conjugacoes: conj({ ich: "stehe auf", du: "stehst auf", er: "steht auf", wir: "stehen auf", ihr: "steht auf", sie: "stehen auf" }, { ich: "stand auf", du: "standst auf", er: "stand auf", wir: "standen auf", ihr: "standet auf", sie: "standen auf" }, "ist aufgestanden") },
    { infinitivo: "aufmachen", traducaoPt: "abrir", raiz: "mach-", separavel: true, irregular: false, moduleId: a1m7.id,
      conjugacoes: conj({ ich: "mache auf", du: "machst auf", er: "macht auf", wir: "machen auf", ihr: "macht auf", sie: "machen auf" }, { ich: "machte auf", du: "machtest auf", er: "machte auf", wir: "machten auf", ihr: "machtet auf", sie: "machten auf" }, "hat aufgemacht") },
    { infinitivo: "anrufen", traducaoPt: "telefonar / ligar", raiz: "ruf-", separavel: true, irregular: true, moduleId: a1m7.id,
      conjugacoes: conj({ ich: "rufe an", du: "rufst an", er: "ruft an", wir: "rufen an", ihr: "ruft an", sie: "rufen an" }, { ich: "rief an", du: "riefst an", er: "rief an", wir: "riefen an", ihr: "rieft an", sie: "riefen an" }, "hat angerufen") },
    { infinitivo: "einkaufen", traducaoPt: "fazer compras", raiz: "kauf-", separavel: true, irregular: false, moduleId: a1m7.id,
      conjugacoes: conj({ ich: "kaufe ein", du: "kaufst ein", er: "kauft ein", wir: "kaufen ein", ihr: "kauft ein", sie: "kaufen ein" }, { ich: "kaufte ein", du: "kauftest ein", er: "kaufte ein", wir: "kauften ein", ihr: "kauftet ein", sie: "kauften ein" }, "hat eingekauft") },
    { infinitivo: "arbeiten", traducaoPt: "trabalhar", raiz: "arbeit-", separavel: false, irregular: false, moduleId: a1m7.id,
      conjugacoes: conj({ ich: "arbeite", du: "arbeitest", er: "arbeitet", wir: "arbeiten", ihr: "arbeitet", sie: "arbeiten" }, { ich: "arbeitete", du: "arbeitetest", er: "arbeitete", wir: "arbeiteten", ihr: "arbeitetet", sie: "arbeiteten" }, "hat gearbeitet") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Verbos Separáveis (Trennbare Verben)", moduleId: a1m7.id,
    conteudo: `# Verbos Separáveis

Em alemão, muitos verbos têm um **prefixo separável** que, em frases principais no presente e pretérito, se desloca para o **fim da frase**.

## Prefixos separáveis mais comuns

**auf-** (abrir, acordar), **an-** (ligar, começar), **ab-** (partir, retirar), **ein-** (entrar, comprar), **aus-** (sair, apagar), **mit-** (ir junto)

## Como funciona no presente

| Infinitivo | Frase |
|-----------|-------|
| **auf**stehen | Ich stehe um 7 Uhr **auf**. |
| **an**rufen | Er ruft seine Mutter **an**. |
| **ein**kaufen | Wir kaufen heute **ein**. |

O prefixo vai para o **fim** — última posição da frase.

## No Perfekt

O **ge-** entra entre o prefixo e o radical:
- aufstehen → **auf**ge**standen**
- anrufen → **an**ge**rufen**
- einkaufen → **ein**ge**kauft**

## No Infinitivo com zu

O **zu** entra no meio:
- aufzustehen, anzurufen, einzukaufen`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "ordenacao", pergunta: "Ordena: [ruft / Er / an / Maria]", resposta: "Er ruft Maria an.", explicacao: "'anrufen' é separável: ruft em 2ª posição, 'an' no fim." },
      { id: 2, tipo: "preenchimento", pergunta: "Perfekt de einkaufen: Wir haben heute ___.", resposta: "eingekauft", explicacao: "ge- entra entre 'ein' e 'kauft': eingekauft." },
      { id: 3, tipo: "escolha-multipla", pergunta: "Qual está correto?", opcoes: ["Ich aufmache das Fenster.", "Ich mache das Fenster auf.", "Ich mache auf das Fenster."], resposta: "Ich mache das Fenster auf.", explicacao: "O prefixo 'auf' vai para o fim." },
    ]),
  }});

  // ═══════════════════════════════════════════════════════════════════════════
  // A2 — 7 módulos com conteúdo completo
  // ═══════════════════════════════════════════════════════════════════════════

  // ── A2 M1: Compras e lojas ────────────────────────────────────────────────
  const a2m1 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Compras e lojas", tema: "compras", ordem: 1 } });

  await prisma.word.createMany({ data: [
    { alemao: "das Geschäft", artigo: "das", genero: "neutro", raiz: "De Geschäft, 'ocupação, negócio'", traducaoPt: "a loja / o negócio", plural: "die Geschäfte", exemplo: "Das Geschäft ist bis 20 Uhr geöffnet.", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "der Supermarkt", artigo: "der", genero: "masc", raiz: "Super- + Markt (mercado)", traducaoPt: "o supermercado", plural: "die Supermärkte", exemplo: "Ich gehe in den Supermarkt.", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "die Kasse", artigo: "die", genero: "fem", raiz: "Do italiano cassa (caixa)", traducaoPt: "a caixa (registadora)", plural: "die Kassen", exemplo: "Ich zahle an der Kasse.", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "der Preis", artigo: "der", genero: "masc", raiz: "Do latim pretium", traducaoPt: "o preço", plural: "die Preise", exemplo: "Was ist der Preis?", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "das Geld", artigo: "das", genero: "neutro", raiz: "Do proto-germânico *geldą", traducaoPt: "o dinheiro", plural: "die Gelder", exemplo: "Ich habe kein Geld.", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "die Größe", artigo: "die", genero: "fem", raiz: "De groß (grande) + -e", traducaoPt: "o tamanho / o número", plural: "die Größen", exemplo: "Welche Größe haben Sie?", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
    { alemao: "das Angebot", artigo: "das", genero: "neutro", raiz: "An- + Gebot (oferta)", traducaoPt: "a oferta / a promoção", plural: "die Angebote", exemplo: "Das ist ein gutes Angebot.", tema: "compras", tipo: "palavra", moduleId: a2m1.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "kaufen", traducaoPt: "comprar", raiz: "kauf-", separavel: false, irregular: false, moduleId: a2m1.id,
      conjugacoes: conj({ ich: "kaufe", du: "kaufst", er: "kauft", wir: "kaufen", ihr: "kauft", sie: "kaufen" }, { ich: "kaufte", du: "kauftest", er: "kaufte", wir: "kauften", ihr: "kauftet", sie: "kauften" }, "hat gekauft") },
    { infinitivo: "kosten", traducaoPt: "custar", raiz: "kost-", separavel: false, irregular: false, moduleId: a2m1.id,
      conjugacoes: conj({ ich: "koste", du: "kostest", er: "kostet", wir: "kosten", ihr: "kostet", sie: "kosten" }, { ich: "kostete", du: "kostetest", er: "kostete", wir: "kosteten", ihr: "kostetet", sie: "kosteten" }, "hat gekostet") },
    { infinitivo: "bezahlen", traducaoPt: "pagar", raiz: "zahl-", separavel: false, irregular: false, moduleId: a2m1.id,
      conjugacoes: conj({ ich: "bezahle", du: "bezahlst", er: "bezahlt", wir: "bezahlen", ihr: "bezahlt", sie: "bezahlen" }, { ich: "bezahlte", du: "bezahltest", er: "bezahlte", wir: "bezahlten", ihr: "bezahltet", sie: "bezahlten" }, "hat bezahlt") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Os Casos: Nominativo e Acusativo", moduleId: a2m1.id,
    conteudo: `# Nominativo e Acusativo

O alemão usa **casos gramaticais** para indicar a função de cada palavra na frase.

## Nominativo — o sujeito

O **nominativo** marca quem pratica a ação:
> **Der Mann** kauft ein Buch.

## Acusativo — o objeto direto

O **acusativo** marca quem recebe a ação:
> Der Mann kauft **ein Buch**.

## Como os artigos mudam

| Género | Nominativo | Acusativo |
|--------|-----------|-----------|
| Masc. | **der** / ein | **den** / **einen** |
| Fem. | die / eine | die / eine |
| Neutro | das / ein | das / ein |
| Plural | die / — | die / — |

**Só o masculino muda no acusativo!**

## Pronomes pessoais no acusativo

| Nominativo | Acusativo |
|-----------|----------|
| ich | **mich** |
| du | **dich** |
| er | **ihn** |
| sie | **sie** |
| wir | **uns** |
| ihr | **euch** |`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "escolha-multipla", pergunta: "Ich sehe ___ Mann.", opcoes: ["der", "den", "dem"], resposta: "den", explicacao: "Masculino em acusativo: den." },
      { id: 2, tipo: "preenchimento", pergunta: "Traduz: 'Eu tenho um cão (Hund, masc.)'", resposta: "Ich habe einen Hund.", explicacao: "Hund é masc. em acusativo: einen." },
    ]),
  }});

  // ── A2 M2: Passado 1 — Perfekt com verbos regulares ─────────────────────
  const a2m2 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Falar do passado (1)", tema: "passado", ordem: 2 } });

  await prisma.word.createMany({ data: [
    { alemao: "gestern", artigo: "", genero: "—", raiz: "Do proto-germânico *gestraz", traducaoPt: "ontem", plural: "", exemplo: "Gestern war ich müde.", tema: "tempo", tipo: "palavra", moduleId: a2m2.id },
    { alemao: "letzte Woche", artigo: "", genero: "—", raiz: "letzt- (último) + Woche", traducaoPt: "na semana passada", plural: "", exemplo: "Letzte Woche habe ich Deutsch gelernt.", tema: "tempo", tipo: "chunk", moduleId: a2m2.id },
    { alemao: "schon", artigo: "", genero: "—", raiz: "Do proto-germânico *skaunō", traducaoPt: "já", plural: "", exemplo: "Ich habe das schon gemacht.", tema: "tempo", tipo: "palavra", moduleId: a2m2.id },
    { alemao: "noch nicht", artigo: "", genero: "—", raiz: "noch (ainda) + nicht (não)", traducaoPt: "ainda não", plural: "", exemplo: "Ich habe das noch nicht gemacht.", tema: "tempo", tipo: "chunk", moduleId: a2m2.id },
    { alemao: "das Wochenende", artigo: "das", genero: "neutro", raiz: "Woche + Ende (fim)", traducaoPt: "o fim de semana", plural: "die Wochenenden", exemplo: "Am Wochenende war ich zu Hause.", tema: "tempo", tipo: "palavra", moduleId: a2m2.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "machen", traducaoPt: "fazer", raiz: "mach-", separavel: false, irregular: false, moduleId: a2m2.id,
      conjugacoes: conj({ ich: "mache", du: "machst", er: "macht", wir: "machen", ihr: "macht", sie: "machen" }, { ich: "machte", du: "machtest", er: "machte", wir: "machten", ihr: "machtet", sie: "machten" }, "hat gemacht") },
    { infinitivo: "spielen", traducaoPt: "jogar / tocar (instrumento)", raiz: "spiel-", separavel: false, irregular: false, moduleId: a2m2.id,
      conjugacoes: conj({ ich: "spiele", du: "spielst", er: "spielt", wir: "spielen", ihr: "spielt", sie: "spielen" }, { ich: "spielte", du: "spieltest", er: "spielte", wir: "spielten", ihr: "spieltet", sie: "spielten" }, "hat gespielt") },
    { infinitivo: "sagen", traducaoPt: "dizer", raiz: "sag-", separavel: false, irregular: false, moduleId: a2m2.id,
      conjugacoes: conj({ ich: "sage", du: "sagst", er: "sagt", wir: "sagen", ihr: "sagt", sie: "sagen" }, { ich: "sagte", du: "sagtest", er: "sagte", wir: "sagten", ihr: "sagtet", sie: "sagten" }, "hat gesagt") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "O Pretérito Perfeito — Verbos Regulares", moduleId: a2m2.id,
    conteudo: `# O Perfekt — Pretérito Perfeito

O **Perfekt** é o tempo do passado mais usado em alemão falado. É formado por dois elementos:

> **haben/sein** (presente) + **Partizip II** (particípio)

## Formação do Partizip II — verbos regulares

**ge-** + radical + **-t**

| Infinitivo | Partizip II |
|-----------|------------|
| machen | ge**macht** |
| spielen | ge**spielt** |
| lernen | ge**lernt** |
| kaufen | ge**kauft** |
| arbeiten | ge**arbeitet** (radical em -t/-d) |

## Auxiliar: haben ou sein?

**sein** → verbos de movimento ou mudança de estado:
- gehen → **ist** gegangen
- kommen → **ist** gekommen
- fahren → **ist** gefahren

**haben** → todos os outros (transitivos e muitos intransitivos):
- machen → **hat** gemacht
- lernen → **hat** gelernt

## Posição na frase

O particípio vai para o **fim**:
- Ich **habe** gestern viel **gelernt**.
- Er **ist** nach Hause **gegangen**.`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "preenchimento", pergunta: "Forma o Perfekt: Ich ___ Fußball ___ (spielen).", resposta: "habe / gespielt", explicacao: "spielen usa haben; Partizip II = gespielt." },
      { id: 2, tipo: "escolha-multipla", pergunta: "Qual auxiliar usa 'gehen'?", opcoes: ["hat", "ist", "bin"], resposta: "ist", explicacao: "Verbos de movimento usam sein." },
      { id: 3, tipo: "preenchimento", pergunta: "Partizip II de 'arbeiten':", resposta: "gearbeitet", explicacao: "Radical arbeit- termina em -t: ge + arbeit + et." },
    ]),
  }});

  // ── A2 M3: Saúde e corpo ─────────────────────────────────────────────────
  const a2m3 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Saúde e corpo", tema: "saúde", ordem: 3 } });

  await prisma.word.createMany({ data: [
    { alemao: "der Arzt", artigo: "der", genero: "masc", raiz: "Do grego arkhiatros", traducaoPt: "o médico", plural: "die Ärzte", exemplo: "Der Arzt kommt gleich.", tema: "saúde", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "das Krankenhaus", artigo: "das", genero: "neutro", raiz: "Krank (doente) + Haus", traducaoPt: "o hospital", plural: "die Krankenhäuser", exemplo: "Er liegt im Krankenhaus.", tema: "saúde", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "der Kopf", artigo: "der", genero: "masc", raiz: "Do proto-germânico *kuppaz", traducaoPt: "a cabeça", plural: "die Köpfe", exemplo: "Mein Kopf tut weh.", tema: "corpo", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "der Bauch", artigo: "der", genero: "masc", raiz: "Do proto-germânico *baukaz", traducaoPt: "a barriga", plural: "die Bäuche", exemplo: "Ich habe Bauchschmerzen.", tema: "corpo", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "das Fieber", artigo: "das", genero: "neutro", raiz: "Do latim febris", traducaoPt: "a febre", plural: "", exemplo: "Ich habe Fieber.", tema: "saúde", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "die Erkältung", artigo: "die", genero: "fem", raiz: "De erkälten (arrefecer) + -ung", traducaoPt: "a constipação", plural: "die Erkältungen", exemplo: "Ich habe eine Erkältung.", tema: "saúde", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "das Medikament", artigo: "das", genero: "neutro", raiz: "Do latim medicamentum", traducaoPt: "o medicamento", plural: "die Medikamente", exemplo: "Der Arzt gibt mir ein Medikament.", tema: "saúde", tipo: "palavra", moduleId: a2m3.id },
    { alemao: "Mir tut ... weh", artigo: "", genero: "—", raiz: "tun + weh (dor)", traducaoPt: "Dói-me... / Tenho dores em...", plural: "", exemplo: "Mir tut der Rücken weh.", tema: "saúde", tipo: "chunk", moduleId: a2m3.id },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Verbos Modais no Presente", moduleId: a2m3.id,
    conteudo: `# Verbos Modais (Modalverben)

Os verbos modais modificam o significado do verbo principal e exigem o infinitivo no fim da frase.

## Os 6 verbos modais

| Verbo | Significado | ich | du | er |
|-------|-------------|-----|----|----|
| **können** | poder (capacidade) | kann | kannst | kann |
| **müssen** | ter de (obrigação) | muss | musst | muss |
| **dürfen** | poder (permissão) | darf | darfst | darf |
| **wollen** | querer | will | willst | will |
| **sollen** | dever (dever externo) | soll | sollst | soll |
| **möchten** | gostaria (desejo gentil) | möchte | möchtest | möchte |

## Estrutura da frase

**Modal (2ª posição) + ... + Infinitivo (fim)**

- Ich **kann** gut Deutsch **sprechen**.
- Du **musst** jetzt nach Hause **gehen**.
- Er **möchte** einen Kaffee **trinken**.

## Negação dos modais

- Ich **kann nicht** kommen. (Não posso vir.)
- Du **darfst nicht** rauchen. (Não podes fumar.)`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "preenchimento", pergunta: "Eu posso falar alemão: Ich ___ Deutsch sprechen.", resposta: "kann", explicacao: "'können' conjuga-se 'kann' na 1ª pessoa." },
      { id: 2, tipo: "escolha-multipla", pergunta: "Para expressar obrigação, usa-se:", opcoes: ["können", "müssen", "dürfen"], resposta: "müssen", explicacao: "'müssen' expressa obrigação." },
      { id: 3, tipo: "preenchimento", pergunta: "Completa: Wir ___ jetzt gehen. (devemos ir agora)", resposta: "müssen", explicacao: "1ª pessoa plural de müssen é müssen (sem mudança)." },
    ]),
  }});

  // ── A2 M4: Viagens e transportes ─────────────────────────────────────────
  const a2m4 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Viagens e transportes", tema: "viagem", ordem: 4 } });

  await prisma.word.createMany({ data: [
    { alemao: "das Hotel", artigo: "das", genero: "neutro", raiz: "Do francês hôtel", traducaoPt: "o hotel", plural: "die Hotels", exemplo: "Wir schlafen im Hotel.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "der Flughafen", artigo: "der", genero: "masc", raiz: "Flug (voo) + Hafen (porto)", traducaoPt: "o aeroporto", plural: "die Flughäfen", exemplo: "Der Flughafen ist weit.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "der Zug", artigo: "der", genero: "masc", raiz: "De ziehen (puxar)", traducaoPt: "o comboio", plural: "die Züge", exemplo: "Der Zug fährt um 10 Uhr ab.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "das Ticket", artigo: "das", genero: "neutro", raiz: "Do francês étiquette", traducaoPt: "o bilhete", plural: "die Tickets", exemplo: "Ich kaufe ein Ticket online.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "die Reise", artigo: "die", genero: "fem", raiz: "Do proto-germânico *raisō", traducaoPt: "a viagem", plural: "die Reisen", exemplo: "Die Reise war wunderbar.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "der Koffer", artigo: "der", genero: "masc", raiz: "Do francês coffre", traducaoPt: "a mala (de viagem)", plural: "die Koffer", exemplo: "Mein Koffer ist zu schwer.", tema: "viagem", tipo: "palavra", moduleId: a2m4.id },
    { alemao: "Gute Reise!", artigo: "", genero: "—", raiz: "gut + Reise", traducaoPt: "Boa viagem!", plural: "", exemplo: "Tschüss und gute Reise!", tema: "viagem", tipo: "chunk", moduleId: a2m4.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "abfahren", traducaoPt: "partir (veículo)", raiz: "fahr-", separavel: true, irregular: true, moduleId: a2m4.id,
      conjugacoes: conj({ ich: "fahre ab", du: "fährst ab", er: "fährt ab", wir: "fahren ab", ihr: "fahrt ab", sie: "fahren ab" }, { ich: "fuhr ab", du: "fuhrst ab", er: "fuhr ab", wir: "fuhren ab", ihr: "fuhrt ab", sie: "fuhren ab" }, "ist abgefahren") },
    { infinitivo: "ankommen", traducaoPt: "chegar (a um destino)", raiz: "komm-", separavel: true, irregular: true, moduleId: a2m4.id,
      conjugacoes: conj({ ich: "komme an", du: "kommst an", er: "kommt an", wir: "kommen an", ihr: "kommt an", sie: "kommen an" }, { ich: "kam an", du: "kamst an", er: "kam an", wir: "kamen an", ihr: "kamt an", sie: "kamen an" }, "ist angekommen") },
    { infinitivo: "fliegen", traducaoPt: "voar", raiz: "flieg-", separavel: false, irregular: true, moduleId: a2m4.id,
      conjugacoes: conj({ ich: "fliege", du: "fliegst", er: "fliegt", wir: "fliegen", ihr: "fliegt", sie: "fliegen" }, { ich: "flog", du: "flogst", er: "flog", wir: "flogen", ihr: "flogt", sie: "flogen" }, "ist geflogen") },
    { infinitivo: "schlafen", traducaoPt: "dormir", raiz: "schlaf-", separavel: false, irregular: true, moduleId: a2m4.id,
      conjugacoes: conj({ ich: "schlafe", du: "schläfst", er: "schläft", wir: "schlafen", ihr: "schlaft", sie: "schlafen" }, { ich: "schlief", du: "schliefst", er: "schlief", wir: "schliefen", ihr: "schlieft", sie: "schliefen" }, "hat geschlafen") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "O Pretérito Perfeito — Verbos Irregulares", moduleId: a2m4.id,
    conteudo: `# Perfekt — Verbos Irregulares (Starke Verben)

Os verbos fortes formam o Partizip II de forma irregular — o radical muda:

**ge-** + radical modificado + **-en**

## Verbos irregulares mais importantes

| Infinitivo | Partizip II | Auxiliar |
|-----------|------------|---------|
| gehen | ge**gang**en | ist |
| kommen | ge**komm**en | ist |
| fahren | ge**fahr**en | ist |
| fliegen | ge**flog**en | ist |
| schlafen | ge**schlaf**en | hat |
| essen | ge**gess**en | hat |
| trinken | ge**trunk**en | hat |
| sprechen | ge**sproch**en | hat |
| schreiben | ge**schrieb**en | hat |
| sehen | ge**seh**en | hat |
| lesen | ge**les**en | hat |

## Verbos sein e haben no Perfekt

- sein: **ist gewesen**
- haben: **hat gehabt**

## Dica de estudo

Aprende os verbos irregulares em grupos por padrão de mudança vocálica:
- i → a → u: trinken → trank → **getrunken**
- ei → ie → ie: schreiben → schrieb → **geschrieben**`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "preenchimento", pergunta: "Partizip II de 'schreiben':", resposta: "geschrieben", explicacao: "ei→ie: schreiben → geschrieben." },
      { id: 2, tipo: "preenchimento", pergunta: "Perfekt de 'fliegen': Er ___ nach Berlin ___.", resposta: "ist / geflogen", explicacao: "fliegen é movimento: sein + geflogen." },
      { id: 3, tipo: "escolha-multipla", pergunta: "Partizip II de 'essen':", opcoes: ["geesst", "gegessen", "geessen"], resposta: "gegessen", explicacao: "essen → gegessen (verbo forte)." },
    ]),
  }});

  // ── A2 M5: Tempo livre e hobbies ─────────────────────────────────────────
  const a2m5 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Tempo livre e hobbies", tema: "lazer", ordem: 5 } });

  await prisma.word.createMany({ data: [
    { alemao: "das Hobby", artigo: "das", genero: "neutro", raiz: "Do inglês hobby", traducaoPt: "o passatempo / o hobby", plural: "die Hobbys", exemplo: "Mein Hobby ist Fußball.", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "der Sport", artigo: "der", genero: "masc", raiz: "Do inglês sport", traducaoPt: "o desporto", plural: "die Sportarten", exemplo: "Ich treibe gern Sport.", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "die Musik", artigo: "die", genero: "fem", raiz: "Do grego mousike", traducaoPt: "a música", plural: "", exemplo: "Ich höre gern Musik.", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "das Konzert", artigo: "das", genero: "neutro", raiz: "Do italiano concerto", traducaoPt: "o concerto", plural: "die Konzerte", exemplo: "Wir gehen heute ins Konzert.", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "das Kino", artigo: "das", genero: "neutro", raiz: "Do grego kinema (movimento)", traducaoPt: "o cinema", plural: "die Kinos", exemplo: "Kommst du mit ins Kino?", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "lesen", artigo: "", genero: "—", raiz: "Do proto-germânico *lesaną", traducaoPt: "ler (como hobby)", plural: "", exemplo: "Ich lese gern Romane.", tema: "lazer", tipo: "palavra", moduleId: a2m5.id },
    { alemao: "im Sommer / im Winter", artigo: "", genero: "—", raiz: "Sommer/Winter com preposição im", traducaoPt: "no verão / no inverno", plural: "", exemplo: "Im Sommer fahre ich ans Meer.", tema: "lazer", tipo: "chunk", moduleId: a2m5.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "lesen", traducaoPt: "ler", raiz: "les-", separavel: false, irregular: true, moduleId: a2m5.id,
      conjugacoes: conj({ ich: "lese", du: "liest", er: "liest", wir: "lesen", ihr: "lest", sie: "lesen" }, { ich: "las", du: "last", er: "las", wir: "lasen", ihr: "last", sie: "lasen" }, "hat gelesen") },
    { infinitivo: "hören", traducaoPt: "ouvir / escutar", raiz: "hör-", separavel: false, irregular: false, moduleId: a2m5.id,
      conjugacoes: conj({ ich: "höre", du: "hörst", er: "hört", wir: "hören", ihr: "hört", sie: "hören" }, { ich: "hörte", du: "hörtest", er: "hörte", wir: "hörten", ihr: "hörtet", sie: "hörten" }, "hat gehört") },
    { infinitivo: "treffen", traducaoPt: "encontrar(-se) / acertar", raiz: "treff-", separavel: false, irregular: true, moduleId: a2m5.id,
      conjugacoes: conj({ ich: "treffe", du: "triffst", er: "trifft", wir: "treffen", ihr: "trefft", sie: "treffen" }, { ich: "traf", du: "trafst", er: "traf", wir: "trafen", ihr: "traft", sie: "trafen" }, "hat getroffen") },
  ]});

  await prisma.grammarModule.create({ data: {
    titulo: "Preposições de Tempo", moduleId: a2m5.id,
    conteudo: `# Preposições de Tempo

## an — dias e partes do dia

- **am** Montag (na segunda-feira)
- **am** Wochenende (ao fim de semana)
- **am** Morgen / Abend (de manhã / à noite)

## in — meses, estações, anos

- **im** Januar (em janeiro)
- **im** Sommer (no verão)
- **im** Jahr 2024 (no ano de 2024)

## um — horas exatas

- **um** 8 Uhr (às 8 horas)
- **um** Mitternacht (à meia-noite)

## von ... bis — de ... até

- **von** Montag **bis** Freitag
- **von** 9 **bis** 17 Uhr

## seit — desde / há (duração até agora)

- **seit** drei Jahren (há três anos)
- **seit** Montag (desde segunda-feira)

## vor / nach / während

- **vor** dem Essen (antes da refeição)
- **nach** der Arbeit (depois do trabalho)
- **während** des Konzerts (durante o concerto)`,
    exercicios: JSON.stringify([
      { id: 1, tipo: "preenchimento", pergunta: "___ Freitag habe ich frei. (Na sexta-feira)", resposta: "Am", explicacao: "Dias da semana usam 'am' (an + dem)." },
      { id: 2, tipo: "preenchimento", pergunta: "Ich lerne Deutsch ___ zwei Jahren. (há dois anos)", resposta: "seit", explicacao: "'seit' indica duração desde o passado até agora." },
      { id: 3, tipo: "escolha-multipla", pergunta: "Der Zug fährt ___ 15 Uhr ab.", opcoes: ["am", "im", "um"], resposta: "um", explicacao: "'um' usa-se para horas exatas." },
    ]),
  }});

  // ── A2 M6: Casa e convívio social ────────────────────────────────────────
  const a2m6 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Casa e convívio social", tema: "convívio", ordem: 6 } });

  await prisma.word.createMany({ data: [
    { alemao: "die Einladung", artigo: "die", genero: "fem", raiz: "einladen (convidar) + -ung", traducaoPt: "o convite", plural: "die Einladungen", exemplo: "Danke für die Einladung!", tema: "convívio", tipo: "palavra", moduleId: a2m6.id },
    { alemao: "der Gast", artigo: "der", genero: "masc", raiz: "Do proto-germânico *gastiz", traducaoPt: "o convidado / o hóspede", plural: "die Gäste", exemplo: "Wir haben heute Gäste.", tema: "convívio", tipo: "palavra", moduleId: a2m6.id },
    { alemao: "das Geschenk", artigo: "das", genero: "neutro", raiz: "De schenken (oferecer)", traducaoPt: "o presente / o regalo", plural: "die Geschenke", exemplo: "Ich habe ein Geschenk mitgebracht.", tema: "convívio", tipo: "palavra", moduleId: a2m6.id },
    { alemao: "der Geburtstag", artigo: "der", genero: "masc", raiz: "Geburt (nascimento) + Tag (dia)", traducaoPt: "o aniversário", plural: "die Geburtstage", exemplo: "Herzlichen Glückwunsch zum Geburtstag!", tema: "convívio", tipo: "palavra", moduleId: a2m6.id },
    { alemao: "Herzlichen Glückwunsch!", artigo: "", genero: "—", raiz: "herzlich (cordial) + Glückwunsch (felicitação)", traducaoPt: "Parabéns! / Felicitações!", plural: "", exemplo: "Herzlichen Glückwunsch zum Geburtstag!", tema: "convívio", tipo: "chunk", moduleId: a2m6.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "einladen", traducaoPt: "convidar", raiz: "lad-", separavel: true, irregular: true, moduleId: a2m6.id,
      conjugacoes: conj({ ich: "lade ein", du: "lädst ein", er: "lädt ein", wir: "laden ein", ihr: "ladet ein", sie: "laden ein" }, { ich: "lud ein", du: "ludst ein", er: "lud ein", wir: "luden ein", ihr: "ludt ein", sie: "luden ein" }, "hat eingeladen") },
    { infinitivo: "mitbringen", traducaoPt: "trazer (consigo)", raiz: "bring-", separavel: true, irregular: true, moduleId: a2m6.id,
      conjugacoes: conj({ ich: "bringe mit", du: "bringst mit", er: "bringt mit", wir: "bringen mit", ihr: "bringt mit", sie: "bringen mit" }, { ich: "brachte mit", du: "brachtest mit", er: "brachte mit", wir: "brachten mit", ihr: "brachtet mit", sie: "brachten mit" }, "hat mitgebracht") },
    { infinitivo: "helfen", traducaoPt: "ajudar", raiz: "helf-", separavel: false, irregular: true, moduleId: a2m6.id,
      conjugacoes: conj({ ich: "helfe", du: "hilfst", er: "hilft", wir: "helfen", ihr: "helft", sie: "helfen" }, { ich: "half", du: "halfst", er: "half", wir: "halfen", ihr: "halft", sie: "halfen" }, "hat geholfen") },
  ]});

  await prisma.grammarModule.createMany({ data: [
    {
      titulo: "O Dativo", moduleId: a2m6.id,
      conteudo: `# O Dativo — Objeto Indireto

O **dativo** marca o objeto indireto (a quem/para quem se faz algo).

## Artigos no dativo

| Género | Nominativo | Dativo |
|--------|-----------|--------|
| Masc. | der / ein | **dem / einem** |
| Fem. | die / eine | **der / einer** |
| Neutro | das / ein | **dem / einem** |
| Plural | die / — | **den / —** (+n nos substantivos) |

## Preposições que regem sempre dativo

**aus, bei, mit, nach, seit, von, zu, gegenüber**

- Ich fahre **mit dem** Bus.
- Ich komme **aus der** Schweiz.
- Wir gehen **zu dem** (= **zum**) Arzt.

## Pronomes no dativo

| Nominativo | Dativo |
|-----------|--------|
| ich | **mir** |
| du | **dir** |
| er | **ihm** |
| sie | **ihr** |
| wir | **uns** |
| ihr | **euch** |`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "escolha-multipla", pergunta: "Ich gebe ___ Frau ein Geschenk.", opcoes: ["die", "der", "den"], resposta: "der", explicacao: "Frau é feminino; no dativo, feminino usa 'der'." },
        { id: 2, tipo: "preenchimento", pergunta: "Ich komme ___ Portugal. (preposição de origem)", resposta: "aus", explicacao: "'aus' indica origem e rege sempre dativo." },
      ]),
    },
    {
      titulo: "Orações Subordinadas com weil, dass, wenn", moduleId: a2m6.id,
      conteudo: `# Orações Subordinadas

Nas orações subordinadas em alemão, o verbo conjugado vai para o **fim** da oração.

## weil — porque (causa)

> Ich lerne Deutsch, **weil** ich in Deutschland arbeiten **will**.
> (Aprendo alemão porque quero trabalhar na Alemanha.)

## dass — que (complemento)

> Ich denke, **dass** du Recht **hast**.
> (Penso que tens razão.)

## wenn — quando / se (condição ou temporalidade)

> **Wenn** ich Zeit **habe**, lerne ich Deutsch.
> (Quando tenho tempo, estudo alemão.)

## Estrutura

**Conjunção + Subjekt + ... + Verb (fim)**

A vírgula separa sempre a oração principal da subordinada.`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "ordenacao", pergunta: "Completa: Ich bin müde, weil... [viel / ich / gearbeitet / habe]", resposta: "weil ich viel gearbeitet habe.", explicacao: "Na oração com 'weil', o verbo vai para o fim." },
        { id: 2, tipo: "preenchimento", pergunta: "Ich glaube, ___ er krank ist.", resposta: "dass", explicacao: "'dass' introduz um complemento direto." },
      ]),
    },
  ]});

  // ── A2 M7: Opinião e comparação ───────────────────────────────────────────
  const a2m7 = await prisma.module.create({ data: { levelId: a2.id, titulo: "Opinião e comparação", tema: "opinião", ordem: 7 } });

  await prisma.word.createMany({ data: [
    { alemao: "Ich finde, dass...", artigo: "", genero: "—", raiz: "finden (achar)", traducaoPt: "Acho que... / Considero que...", plural: "", exemplo: "Ich finde, dass Deutsch schwer ist.", tema: "opinião", tipo: "chunk", moduleId: a2m7.id },
    { alemao: "Meiner Meinung nach...", artigo: "", genero: "—", raiz: "Meinung (opinião) + nach", traducaoPt: "Na minha opinião...", plural: "", exemplo: "Meiner Meinung nach ist das falsch.", tema: "opinião", tipo: "chunk", moduleId: a2m7.id },
    { alemao: "besser / schlechter", artigo: "", genero: "—", raiz: "Comparativos de gut/schlecht", traducaoPt: "melhor / pior", plural: "", exemplo: "Mein Deutsch wird immer besser.", tema: "opinião", tipo: "palavra", moduleId: a2m7.id },
    { alemao: "lieber", artigo: "", genero: "—", raiz: "Comparativo de gern", traducaoPt: "preferencialmente / de preferência", plural: "", exemplo: "Ich trinke lieber Tee als Kaffee.", tema: "opinião", tipo: "palavra", moduleId: a2m7.id },
    { alemao: "am liebsten", artigo: "", genero: "—", raiz: "Superlativo de gern", traducaoPt: "de preferência absoluta / o que mais gosto", plural: "", exemplo: "Am liebsten esse ich Pizza.", tema: "opinião", tipo: "chunk", moduleId: a2m7.id },
  ]});

  await prisma.verb.createMany({ data: [
    { infinitivo: "finden", traducaoPt: "encontrar / achar (opinião)", raiz: "find-", separavel: false, irregular: true, moduleId: a2m7.id,
      conjugacoes: conj({ ich: "finde", du: "findest", er: "findet", wir: "finden", ihr: "findet", sie: "finden" }, { ich: "fand", du: "fandst", er: "fand", wir: "fanden", ihr: "fandet", sie: "fanden" }, "hat gefunden") },
    { infinitivo: "vergleichen", traducaoPt: "comparar", raiz: "vergleich-", separavel: false, irregular: true, moduleId: a2m7.id,
      conjugacoes: conj({ ich: "vergleiche", du: "vergleichst", er: "vergleicht", wir: "vergleichen", ihr: "vergleicht", sie: "vergleichen" }, { ich: "verglich", du: "verglichst", er: "verglich", wir: "verglichen", ihr: "verglichet", sie: "verglichen" }, "hat verglichen") },
    { infinitivo: "sprechen", traducaoPt: "falar", raiz: "sprech-", separavel: false, irregular: true, moduleId: a2m7.id,
      conjugacoes: conj({ ich: "spreche", du: "sprichst", er: "spricht", wir: "sprechen", ihr: "sprecht", sie: "sprechen" }, { ich: "sprach", du: "sprachst", er: "sprach", wir: "sprachen", ihr: "spracht", sie: "sprachen" }, "hat gesprochen") },
    { infinitivo: "verstehen", traducaoPt: "compreender / perceber", raiz: "versteh-", separavel: false, irregular: true, moduleId: a2m7.id,
      conjugacoes: conj({ ich: "verstehe", du: "verstehst", er: "versteht", wir: "verstehen", ihr: "versteht", sie: "verstehen" }, { ich: "verstand", du: "verstandst", er: "verstand", wir: "verstanden", ihr: "verstandet", sie: "verstanden" }, "hat verstanden") },
  ]});

  await prisma.grammarModule.createMany({ data: [
    {
      titulo: "Comparativo e Superlativo", moduleId: a2m7.id,
      conteudo: `# Comparativo e Superlativo

## Comparativo — mais ... do que

**Adjetivo + -er + als**

| Adjetivo | Comparativo |
|---------|------------|
| schnell | schnell**er** als |
| groß | größ**er** als |
| gut | **besser** als (irregular) |
| viel | **mehr** als (irregular) |
| gern | **lieber** als (irregular) |

Exemplo: Berlin ist größer **als** München.

## Superlativo — o mais ...

**am + Adjetivo + -sten** (predicativo)
**der/die/das + Adjetivo + -ste** (atributivo)

| Adjetivo | Superlativo |
|---------|------------|
| schnell | am schnellsten / der schnellste |
| groß | am größten |
| gut | **am besten** (irregular) |
| viel | **am meisten** (irregular) |
| gern | **am liebsten** (irregular) |

Exemplo: Das ist **das beste** Restaurant in der Stadt.`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "preenchimento", pergunta: "Berlin ist ___ als Hamburg. (groß)", resposta: "größer", explicacao: "Comparativo de groß: größer (com Umlaut)." },
        { id: 2, tipo: "preenchimento", pergunta: "Superlativo de gut:", resposta: "am besten", explicacao: "Irregular: gut → besser → am besten." },
        { id: 3, tipo: "escolha-multipla", pergunta: "Ich trinke ___ Tee als Kaffee. (prefiro)", opcoes: ["mehr", "lieber", "besser"], resposta: "lieber", explicacao: "'lieber' é o comparativo de 'gern' e indica preferência." },
      ]),
    },
    {
      titulo: "Imperativo", moduleId: a2m7.id,
      conteudo: `# O Imperativo — Dar Ordens e Pedidos

## Imperativo informal (du)

Remove -en do infinitivo, sem pronome:
- machen → **Mach**!
- kommen → **Komm**!
- gehen → **Geh**!

Com verbos de mudança vocálica e→i:
- sprechen → **Sprich** laut!
- essen → **Iss** nicht so schnell!

## Imperativo plural (ihr)

Igual à conjugação normal de ihr, sem pronome:
- machen → **Macht** die Tür zu!
- kommen → **Kommt** bitte!

## Imperativo formal (Sie)

Infinitivo + Sie (na ordem invertida):
- Kommen **Sie** bitte herein!
- Sprechen **Sie** langsam!

## Imperativo com Bitte

**Bitte** torna o imperativo mais educado:
- Bitte **kommen** Sie!
- **Mach** bitte das Fenster auf!`,
      exercicios: JSON.stringify([
        { id: 1, tipo: "preenchimento", pergunta: "Imperativo informal de 'kommen': ___ bitte!", resposta: "Komm", explicacao: "kommen → Komm (remove -en)." },
        { id: 2, tipo: "preenchimento", pergunta: "Imperativo formal de 'sprechen': ___ bitte langsam!", resposta: "Sprechen Sie", explicacao: "Formal: Infinitivo + Sie." },
        { id: 3, tipo: "escolha-multipla", pergunta: "Imperativo de 'essen' (du):", opcoes: ["Esse!", "Esst!", "Iss!"], resposta: "Iss!", explicacao: "essen tem mudança vocálica e→i: iss!" },
      ]),
    },
  ]});

  // ═══════════════════════════════════════════════════════════════════════════
  // B1–C2 — Estrutura sem conteúdo (para expandir depois)
  // ═══════════════════════════════════════════════════════════════════════════

  const b1Modulos = [
    "Trabalho e carreira", "Saúde e bem-estar", "Meio ambiente", "Média e tecnologia",
    "Viagens e culturas", "Relações e sociedade", "Língua e comunicação", "Eventos e experiências",
  ];
  for (let i = 0; i < b1Modulos.length; i++) {
    await prisma.module.create({ data: { levelId: b1.id, titulo: b1Modulos[i], tema: b1Modulos[i].toLowerCase(), ordem: i + 1 } });
  }

  const b2Modulos = [
    "Política e sociedade", "Ciência e tecnologia", "Arte e cultura", "Economia e negócios",
    "Filosofia e ética", "Literatura alemã", "História e memória", "Linguagem formal",
  ];
  for (let i = 0; i < b2Modulos.length; i++) {
    await prisma.module.create({ data: { levelId: b2.id, titulo: b2Modulos[i], tema: b2Modulos[i].toLowerCase(), ordem: i + 1 } });
  }

  const c1Modulos = [
    "Registo académico", "Argumentação avançada", "Metáforas e expressões idiomáticas",
    "Nuances de significado", "Pragmática e ironia", "Textos literários", "Língua jurídica",
  ];
  for (let i = 0; i < c1Modulos.length; i++) {
    await prisma.module.create({ data: { levelId: c1.id, titulo: c1Modulos[i], tema: c1Modulos[i].toLowerCase(), ordem: i + 1 } });
  }

  const c2Modulos = [
    "Domínio total do registo", "Subtileza estilística", "Dialetos e variação",
    "Escrita criativa avançada", "Debate filosófico", "Linguagem poética",
  ];
  for (let i = 0; i < c2Modulos.length; i++) {
    await prisma.module.create({ data: { levelId: c2.id, titulo: c2Modulos[i], tema: c2Modulos[i].toLowerCase(), ordem: i + 1 } });
  }

  // ─── Cenários de conversa ─────────────────────────────────────────────────
  await prisma.scenario.createMany({
    data: [
      {
        titulo: "No Café",
        turnos: JSON.stringify([
          { papel: "Empregado", texto: "Guten Tag! Was darf es sein?", traducao: "Bom dia! O que vai ser?" },
          { papel: "Tu", texto: "Ich hätte gerne einen Kaffee und ein Stück Kuchen, bitte.", traducao: "Queria um café e um pedaço de bolo, por favor." },
          { papel: "Empregado", texto: "Mit Milch und Zucker?", traducao: "Com leite e açúcar?" },
          { papel: "Tu", texto: "Nur mit Milch, bitte. Und haben Sie Apfelkuchen?", traducao: "Só com leite, por favor. E têm bolo de maçã?" },
          { papel: "Empregado", texto: "Ja, natürlich! Der Apfelkuchen ist heute sehr frisch.", traducao: "Sim, claro! O bolo de maçã está muito fresco hoje." },
          { papel: "Tu", texto: "Perfekt! Dann nehme ich das.", traducao: "Perfeito! Então fico com isso." },
          { papel: "Empregado", texto: "Kommt sofort. Ist hier drin oder zum Mitnehmen?", traducao: "Já vem. É para aqui ou para levar?" },
          { papel: "Tu", texto: "Hier drin, bitte. Und die Rechnung, wenn es möglich ist.", traducao: "Para aqui, por favor. E a conta, se for possível." },
          { papel: "Empregado", texto: "Das macht zusammen 5,80 Euro.", traducao: "São 5,80 euros no total." },
          { papel: "Tu", texto: "Hier sind 6 Euro. Stimmt so!", traducao: "Aqui tem 6 euros. Pode ficar com o troco!" },
        ]),
      },
      {
        titulo: "Apresentação Pessoal",
        turnos: JSON.stringify([
          { papel: "Pessoa A", texto: "Hallo! Ich bin neu hier. Mein Name ist Anna.", traducao: "Olá! Sou nova aqui. Chamo-me Anna." },
          { papel: "Tu", texto: "Hallo Anna! Ich heiße Thomas. Woher kommst du?", traducao: "Olá Anna! Chamo-me Thomas. De onde és?" },
          { papel: "Pessoa A", texto: "Ich komme aus Portugal. Und du?", traducao: "Sou de Portugal. E tu?" },
          { papel: "Tu", texto: "Ich bin aus Deutschland, aus München. Wie lange lernst du schon Deutsch?", traducao: "Sou da Alemanha, de Munique. Há quanto tempo aprendes alemão?" },
          { papel: "Pessoa A", texto: "Erst seit drei Monaten. Es ist nicht so einfach!", traducao: "Só há três meses. Não é assim tão fácil!" },
          { papel: "Tu", texto: "Das stimmt, aber du sprichst schon sehr gut. Was machst du beruflich?", traducao: "É verdade, mas já falas muito bem. O que fazes profissionalmente?" },
          { papel: "Pessoa A", texto: "Ich bin Studentin. Ich studiere Informatik. Und du?", traducao: "Sou estudante. Estudo Informática. E tu?" },
          { papel: "Tu", texto: "Ich arbeite als Ingenieur. Es war schön, dich kennenzulernen!", traducao: "Trabalho como engenheiro. Foi um prazer conhecer-te!" },
          { papel: "Pessoa A", texto: "Sehr angenehm! Bis bald!", traducao: "Igualmente! Até breve!" },
        ]),
      },
      {
        titulo: "No Restaurante",
        turnos: JSON.stringify([
          { papel: "Empregado", texto: "Guten Abend! Haben Sie reserviert?", traducao: "Boa noite! Tem reserva?" },
          { papel: "Tu", texto: "Ja, auf den Namen Müller. Für zwei Personen.", traducao: "Sim, em nome de Müller. Para duas pessoas." },
          { papel: "Empregado", texto: "Einen Moment bitte... Ah ja, hier entlang bitte.", traducao: "Um momento por favor... Ah sim, por aqui por favor." },
          { papel: "Tu", texto: "Danke. Können wir die Speisekarte haben?", traducao: "Obrigado. Podemos ter a ementa?" },
          { papel: "Empregado", texto: "Natürlich! Was möchten Sie trinken?", traducao: "Claro! O que desejam beber?" },
          { papel: "Tu", texto: "Ein Glas Weißwein für mich und ein Mineralwasser für meine Begleiterin.", traducao: "Um copo de vinho branco para mim e uma água mineral para a minha acompanhante." },
          { papel: "Empregado", texto: "Sehr gerne. Haben Sie schon gewählt?", traducao: "Com muito gosto. Já escolheram?" },
          { papel: "Tu", texto: "Ich nehme das Wiener Schnitzel. Ist das mit Beilage?", traducao: "Fico com o Wiener Schnitzel. Vem com acompanhamento?" },
          { papel: "Empregado", texto: "Ja, mit Kartoffeln und Salat. Eine ausgezeichnete Wahl!", traducao: "Sim, com batatas e salada. Uma excelente escolha!" },
          { papel: "Tu", texto: "Wunderbar. Entschuldigung, können wir am Ende getrennt zahlen?", traducao: "Maravilhoso. Desculpe, podemos pagar separadamente no final?" },
        ]),
      },
      {
        titulo: "No Hotel",
        turnos: JSON.stringify([
          { papel: "Rececionista", texto: "Willkommen im Hotel Zentral! Guten Abend.", traducao: "Bem-vindo ao Hotel Central! Boa noite." },
          { papel: "Tu", texto: "Guten Abend! Ich habe eine Reservierung. Mein Name ist Silva.", traducao: "Boa noite! Tenho uma reserva. O meu nome é Silva." },
          { papel: "Rececionista", texto: "Einen Moment... Ja, ein Doppelzimmer für drei Nächte, richtig?", traducao: "Um momento... Sim, um quarto duplo para três noites, correto?" },
          { papel: "Tu", texto: "Genau. Könnte ich ein ruhiges Zimmer haben? Nicht zur Straße?", traducao: "Exatamente. Poderia ter um quarto sossegado? Não virado para a rua?" },
          { papel: "Rececionista", texto: "Selbstverständlich. Zimmer 302 im dritten Stock hat einen schönen Gartenblick.", traducao: "Claro que sim. O quarto 302 no terceiro andar tem uma bela vista para o jardim." },
          { papel: "Tu", texto: "Perfekt! Um wie viel Uhr ist das Frühstück?", traducao: "Perfeito! A que horas é o pequeno-almoço?" },
          { papel: "Rececionista", texto: "Das Frühstücksbuffet ist von 7 bis 10 Uhr. Es ist im Erdgeschoss.", traducao: "O buffet de pequeno-almoço é das 7 às 10 horas. Fica no rés-do-chão." },
          { papel: "Tu", texto: "Gibt es WLAN auf dem Zimmer?", traducao: "Há Wi-Fi no quarto?" },
          { papel: "Rececionista", texto: "Ja, natürlich. Das Passwort steht auf dieser Karte. Hier ist Ihr Schlüssel.", traducao: "Sim, claro. A palavra-passe está neste cartão. Aqui está a sua chave." },
          { papel: "Tu", texto: "Vielen Dank! Und wo ist der Aufzug?", traducao: "Muito obrigado! E onde fica o elevador?" },
          { papel: "Rececionista", texto: "Der Aufzug ist gleich links. Ich wünsche Ihnen einen angenehmen Aufenthalt!", traducao: "O elevador fica logo à esquerda. Desejo-lhe uma agradável estadia!" },
        ]),
      },
    ],
  });

  // ─── Estado inicial do utilizador (A1, Módulo 1) ─────────────────────────
  await prisma.userState.upsert({
    where:  { id: 1 },
    create: { id: 1, currentLevelId: a1.id, currentModuleId: a1m1.id },
    update: { currentLevelId: a1.id, currentModuleId: a1m1.id },
  });

  // ─── Resumo ───────────────────────────────────────────────────────────────
  const levelCount    = await prisma.level.count();
  const moduleCount   = await prisma.module.count();
  const wordCount     = await prisma.word.count();
  const verbCount     = await prisma.verb.count();
  const grammarCount  = await prisma.grammarModule.count();
  const scenarioCount = await prisma.scenario.count();

  console.log("✅ Seed concluído:");
  console.log(`   ${levelCount} níveis`);
  console.log(`   ${moduleCount} módulos`);
  console.log(`   ${wordCount} palavras`);
  console.log(`   ${verbCount} verbos`);
  console.log(`   ${grammarCount} módulos de gramática`);
  console.log(`   ${scenarioCount} cenários`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
