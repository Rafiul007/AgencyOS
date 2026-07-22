-- CreateEnum
CREATE TYPE "QuoteTemplate" AS ENUM ('CLASSIC', 'MODERN', 'MINIMALIST', 'PROFESSIONAL', 'BOLD');

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "template" "QuoteTemplate";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "defaultQuoteTemplate" "QuoteTemplate" NOT NULL DEFAULT 'CLASSIC';
