-- CreateEnum
CREATE TYPE "CatalogItemType" AS ENUM ('SERVICE', 'PRODUCT', 'PACKAGE', 'ADDON');

-- CreateEnum
CREATE TYPE "PricingUnit" AS ENUM ('FIXED', 'MONTHLY', 'PER_UNIT');

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "CatalogItemType" NOT NULL DEFAULT 'SERVICE',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "pricingUnit" "PricingUnit" NOT NULL DEFAULT 'FIXED',
    "priceMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_items_tenantId_idx" ON "catalog_items"("tenantId");

-- CreateIndex
CREATE INDEX "catalog_items_tenantId_type_idx" ON "catalog_items"("tenantId", "type");

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
