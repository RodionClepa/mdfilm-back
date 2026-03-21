-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- AlterTable
ALTER TABLE "Director" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "earnings" INTEGER,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "placeOfBirth" TEXT;

-- AlterTable
ALTER TABLE "People" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "earnings" INTEGER,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "placeOfBirth" TEXT;
