-- Add slug column to curricula table (nullable initially)
ALTER TABLE "public"."curricula" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing curricula using a simpler approach
UPDATE "public"."curricula" 
SET "slug" = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        name || '-by-' || publisher, 
        '[^a-zA-Z0-9\s-]', '', 'g'
      ), 
      '[\s_-]+', '-', 'g'
    ), 
    '-'
  )
)
WHERE "slug" IS NULL;

-- Handle potential duplicates by appending row number
UPDATE "public"."curricula" 
SET "slug" = "slug" || '-' || ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt")
WHERE "slug" IN (
  SELECT "slug" 
  FROM "public"."curricula" 
  GROUP BY "slug" 
  HAVING COUNT(*) > 1
);

-- Create unique index on slug (after ensuring uniqueness)
CREATE UNIQUE INDEX "curricula_slug_key" ON "public"."curricula"("slug");

-- Make slug column NOT NULL after populating
ALTER TABLE "public"."curricula" ALTER COLUMN "slug" SET NOT NULL;