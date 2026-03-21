-- CreateTable
CREATE TABLE "Bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmarks_user_id_created_at_idx" ON "Bookmarks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "Bookmarks_media_id_idx" ON "Bookmarks"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmarks_user_id_media_id_key" ON "Bookmarks"("user_id", "media_id");

-- AddForeignKey
ALTER TABLE "Bookmarks" ADD CONSTRAINT "Bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmarks" ADD CONSTRAINT "Bookmarks_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE CASCADE ON UPDATE CASCADE;
