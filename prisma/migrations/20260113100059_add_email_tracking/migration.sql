/*
  Warnings:

  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "business_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "day_start_time" TIME(6) DEFAULT '09:00:00'::time without time zone,
    "day_end_time" TIME(6) DEFAULT '17:00:00'::time without time zone,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_user_id_key" ON "business_settings"("user_id");
