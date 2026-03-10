/*
  Warnings:

  - You are about to drop the column `type` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Watch_Links` table. All the data in the column will be lost.
  - You are about to drop the `Episode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type_id` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `Watch_Links` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_season_id_fkey";

-- DropForeignKey
ALTER TABLE "Watch_Links" DROP CONSTRAINT "Watch_Links_episode_id_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "type",
ADD COLUMN     "type_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Watch_Links" DROP COLUMN "type",
ADD COLUMN     "type_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Episode";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "WatchLinkType";

-- CreateTable
CREATE TABLE "Media_Types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Media_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watch_Link_Types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Watch_Link_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episodes" (
    "episode_id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "episode_number" INTEGER NOT NULL,
    "duration_minutes" INTEGER,
    "air_date" TIMESTAMP(3),

    CONSTRAINT "Episodes_pkey" PRIMARY KEY ("episode_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_Types_name_key" ON "Media_Types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_Link_Types_name_key" ON "Watch_Link_Types"("name");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "Media_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episodes" ADD CONSTRAINT "Episodes_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch_Links" ADD CONSTRAINT "Watch_Links_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "Watch_Link_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch_Links" ADD CONSTRAINT "Watch_Links_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episodes"("episode_id") ON DELETE SET NULL ON UPDATE CASCADE;
