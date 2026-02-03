/*
  Warnings:

  - You are about to drop the column `fabricType` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Measurement` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `Measurement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CUSTOM_MAKE', 'RENTAL');

-- DropForeignKey
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_clientId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "fabricType",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "clientId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "memberName" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL DEFAULT 'RENTAL',
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
