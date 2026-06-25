-- AlterTable
ALTER TABLE "ReviewState" ADD COLUMN     "introduzidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN     "novosIntroducidos" INTEGER NOT NULL DEFAULT 0;
