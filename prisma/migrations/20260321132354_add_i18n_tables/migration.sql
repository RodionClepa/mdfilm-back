-- CreateTable
CREATE TABLE "Media_I18n" (
    "id" SERIAL NOT NULL,
    "media_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_I18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Director_I18n" (
    "id" SERIAL NOT NULL,
    "director_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Director_I18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person_I18n" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_I18n_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_I18n_locale_idx" ON "Media_I18n"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "Media_I18n_media_id_locale_key" ON "Media_I18n"("media_id", "locale");

-- Backfill existing data into EN translations
INSERT INTO "Media_I18n" ("media_id", "locale", "title", "synopsis", "created_at", "updated_at")
SELECT m."media_id", 'en', m."title", m."synopsis", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Media" m
ON CONFLICT ("media_id", "locale") DO NOTHING;

-- CreateIndex
CREATE INDEX "Director_I18n_locale_idx" ON "Director_I18n"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "Director_I18n_director_id_locale_key" ON "Director_I18n"("director_id", "locale");

-- Backfill existing data into EN translations
INSERT INTO "Director_I18n" ("director_id", "locale", "name", "biography", "created_at", "updated_at")
SELECT d."id", 'en', d."name", d."biography", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Director" d
ON CONFLICT ("director_id", "locale") DO NOTHING;

-- CreateIndex
CREATE INDEX "Person_I18n_locale_idx" ON "Person_I18n"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "Person_I18n_person_id_locale_key" ON "Person_I18n"("person_id", "locale");

-- Backfill existing data into EN translations
INSERT INTO "Person_I18n" ("person_id", "locale", "name", "biography", "created_at", "updated_at")
SELECT p."id", 'en', p."name", p."biography", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "People" p
ON CONFLICT ("person_id", "locale") DO NOTHING;

-- AddForeignKey
ALTER TABLE "Media_I18n" ADD CONSTRAINT "Media_I18n_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("media_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Director_I18n" ADD CONSTRAINT "Director_I18n_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person_I18n" ADD CONSTRAINT "Person_I18n_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;
