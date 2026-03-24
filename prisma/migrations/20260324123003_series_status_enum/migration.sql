/*
  Warnings:

  - The `status` column on the `Series_Info` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SeriesStatus" AS ENUM ('ONGOING', 'ENDED');

-- AlterTable
ALTER TABLE "Series_Info" DROP COLUMN "status",
ADD COLUMN     "status" "SeriesStatus";
