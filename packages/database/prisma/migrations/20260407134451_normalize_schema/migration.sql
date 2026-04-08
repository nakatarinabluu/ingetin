/*
  Warnings:

  - You are about to drop the column `fullName` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleAccessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleTokenExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `notification_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'WHATSAPP', 'DISCORD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessageStatus" ADD VALUE 'PENDING';
ALTER TYPE "MessageStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullName",
DROP COLUMN "googleAccessToken",
DROP COLUMN "googleRefreshToken",
DROP COLUMN "googleTokenExpiry";

-- DropTable
DROP TABLE "notification_logs";

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "providerId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "tokenType" TEXT,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_providerId_key" ON "social_accounts"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_userId_provider_key" ON "social_accounts"("userId", "provider");

-- CreateIndex
CREATE INDEX "messages_userId_timestamp_idx" ON "messages"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "messages_timestamp_idx" ON "messages"("timestamp");

-- CreateIndex
CREATE INDEX "users_isActivated_idx" ON "users"("isActivated");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
