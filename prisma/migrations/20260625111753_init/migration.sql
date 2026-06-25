-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "percentagem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "terminado" BOOLEAN NOT NULL DEFAULT false,
    "ultimaAtividade" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalExercise" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER,
    "titulo" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "notas" TEXT NOT NULL DEFAULT '',
    "visitado" BOOLEAN NOT NULL DEFAULT false,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "linkPartido" BOOLEAN NOT NULL DEFAULT false,
    "ultimaVisita" TIMESTAMP(3),

    CONSTRAINT "ExternalExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "alemao" TEXT NOT NULL,
    "artigo" TEXT NOT NULL DEFAULT '',
    "genero" TEXT NOT NULL DEFAULT '—',
    "raiz" TEXT NOT NULL DEFAULT '',
    "traducaoPt" TEXT NOT NULL,
    "plural" TEXT NOT NULL DEFAULT '',
    "exemplo" TEXT NOT NULL DEFAULT '',
    "tema" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT 'palavra',
    "moduleId" INTEGER,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verb" (
    "id" SERIAL NOT NULL,
    "infinitivo" TEXT NOT NULL,
    "traducaoPt" TEXT NOT NULL,
    "raiz" TEXT NOT NULL DEFAULT '',
    "separavel" BOOLEAN NOT NULL DEFAULT false,
    "irregular" BOOLEAN NOT NULL DEFAULT false,
    "conjugacoes" TEXT NOT NULL DEFAULT '{}',
    "moduleId" INTEGER,

    CONSTRAINT "Verb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarModule" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "exercicios" TEXT NOT NULL DEFAULT '[]',
    "moduleId" INTEGER,

    CONSTRAINT "GrammarModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "turnos" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewState" (
    "id" SERIAL NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "intervaloDias" INTEGER NOT NULL DEFAULT 1,
    "fatorFacilidade" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repeticoes" INTEGER NOT NULL DEFAULT 0,
    "proximaRevisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaRevisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itensRevistos" INTEGER NOT NULL DEFAULT 0,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "modo" TEXT NOT NULL DEFAULT 'flashcard',

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "tipoQuiz" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_codigo_key" ON "Level"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_moduleId_key" ON "Progress"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewState_itemType_itemId_key" ON "ReviewState"("itemType", "itemId");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalExercise" ADD CONSTRAINT "ExternalExercise_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verb" ADD CONSTRAINT "Verb_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarModule" ADD CONSTRAINT "GrammarModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
