-- Backfill: clients that only had needGownBy keep that as WeddingDate
UPDATE "Client"
SET "WeddingDate" = "needGownBy"
WHERE "WeddingDate" IS NULL AND "needGownBy" IS NOT NULL;

-- Drop needGownBy (was Prisma dueDate); WeddingDate is the only date going forward
ALTER TABLE "Client" DROP COLUMN "needGownBy";
