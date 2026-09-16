-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN "Shoulder" DOUBLE PRECISION NOT NULL DEFAULT 38;

-- Remove default so new rows must supply a value explicitly via app
ALTER TABLE "Measurement" ALTER COLUMN "Shoulder" DROP DEFAULT;
