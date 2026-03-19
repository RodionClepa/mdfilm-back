/*
  Warnings:

  - You are about to drop the column `director_id` on the `Media` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_director_id_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "director_id";

-- CreateTable
CREATE TABLE "Media_Directors" (
    "media_id" INTEGER NOT NULL,
    "director_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_Directors_pkey" PRIMARY KEY ("media_id","director_id")
);

-- AddForeignKey
ALTER TABLE "Media_Directors" ADD CONSTRAINT "Media_Directors_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media_Directors" ADD CONSTRAINT "Media_Directors_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "Director"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
