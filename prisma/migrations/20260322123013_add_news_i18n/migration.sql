-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News_I18n" (
    "id" SERIAL NOT NULL,
    "news_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_I18n_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_created_at_idx" ON "News"("created_at");

-- CreateIndex
CREATE INDEX "News_I18n_locale_idx" ON "News_I18n"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "News_I18n_news_id_locale_key" ON "News_I18n"("news_id", "locale");

-- AddForeignKey
ALTER TABLE "News_I18n" ADD CONSTRAINT "News_I18n_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;
