-- CreateTable
CREATE TABLE "People" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media_Cast" (
    "media_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "character_name" TEXT,
    "billing_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_Cast_pkey" PRIMARY KEY ("media_id","person_id")
);

-- AddForeignKey
ALTER TABLE "Media_Cast" ADD CONSTRAINT "Media_Cast_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media_Cast" ADD CONSTRAINT "Media_Cast_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
