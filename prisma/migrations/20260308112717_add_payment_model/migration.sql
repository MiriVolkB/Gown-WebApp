-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'CUSTOM_MAKE_RENTAL';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'cash';
