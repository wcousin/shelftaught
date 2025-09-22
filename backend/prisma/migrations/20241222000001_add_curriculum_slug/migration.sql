-- Add slug column to curricula table
ALTER TABLE "public"."curricula" ADD COLUMN "slug" TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX "curricula_slug_key" ON "public"."curricula"("slug");

-- Generate slugs for existing curricula (temporary, will be updated by seed script)
UPDATE "public"."curricula" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name || '-by-' || publisher, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s_-]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Make slug column NOT NULL after populating
ALTER TABLE "public"."curricula" ALTER COLUMN "slug" SET NOT NULL;