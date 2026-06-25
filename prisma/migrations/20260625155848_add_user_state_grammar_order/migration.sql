-- AlterTable
ALTER TABLE "GrammarModule" ADD COLUMN     "ordemNoModulo" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "currentLevelId" INTEGER NOT NULL,
    "currentModuleId" INTEGER NOT NULL,

    CONSTRAINT "UserState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserState_currentLevelId_key" ON "UserState"("currentLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "UserState_currentModuleId_key" ON "UserState"("currentModuleId");

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_currentModuleId_fkey" FOREIGN KEY ("currentModuleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
