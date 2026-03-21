-- CreateTable
CREATE TABLE "Homepage_Featured_Media" (
    "id" SERIAL NOT NULL,
    "media_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homepage_Featured_Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Homepage_Featured_Media_enabled_position_idx" ON "Homepage_Featured_Media"("enabled", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Homepage_Featured_Media_media_id_key" ON "Homepage_Featured_Media"("media_id");

-- AddForeignKey
ALTER TABLE "Homepage_Featured_Media" ADD CONSTRAINT "Homepage_Featured_Media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE RESTRICT ON UPDATE CASCADE;
