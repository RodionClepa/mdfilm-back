/*
  Warnings:

  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `content` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `release_date` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('SERIES', 'MOVIE');

-- CreateEnum
CREATE TYPE "WatchLinkType" AS ENUM ('TRAILER', 'FULL', 'CLIP');

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
DROP COLUMN "content",
DROP COLUMN "id",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "director_id" INTEGER,
ADD COLUMN     "media_id" SERIAL NOT NULL,
ADD COLUMN     "poster_image" TEXT,
ADD COLUMN     "release_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "type" "MediaType" NOT NULL,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("media_id");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Director" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie_Info" (
    "media_id" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION,

    CONSTRAINT "Movie_Info_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "Series_Info" (
    "media_id" INTEGER NOT NULL,
    "total_seasons" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT,
    "first_air_date" TIMESTAMP(3) NOT NULL,
    "last_air_date" TIMESTAMP(3),

    CONSTRAINT "Series_Info_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "Season" (
    "season_id" SERIAL NOT NULL,
    "media_id" INTEGER NOT NULL,
    "season_number" INTEGER NOT NULL,
    "release_year" INTEGER NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("season_id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "episode_id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "episode_number" INTEGER NOT NULL,
    "duration_minutes" INTEGER,
    "air_date" TIMESTAMP(3),

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("episode_id")
);

-- CreateTable
CREATE TABLE "Watch_Links" (
    "watch_id" SERIAL NOT NULL,
    "media_id" INTEGER NOT NULL,
    "episode_id" INTEGER,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "WatchLinkType" NOT NULL,

    CONSTRAINT "Watch_Links_pkey" PRIMARY KEY ("watch_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_Info_media_id_key" ON "Movie_Info"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "Series_Info_media_id_key" ON "Series_Info"("media_id");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "Director"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie_Info" ADD CONSTRAINT "Movie_Info_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series_Info" ADD CONSTRAINT "Series_Info_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch_Links" ADD CONSTRAINT "Watch_Links_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch_Links" ADD CONSTRAINT "Watch_Links_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("episode_id") ON DELETE SET NULL ON UPDATE CASCADE;
