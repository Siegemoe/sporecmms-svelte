/*
  Warnings:

  - Added the required column `orgId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "buildingId" TEXT,
ADD COLUMN     "floor" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "buildingId" TEXT,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "assetId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "userId" TEXT,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IPBlock" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "violationCount" INTEGER NOT NULL DEFAULT 1,
    "blockedBy" TEXT,

    CONSTRAINT "IPBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityLog_ipAddress_idx" ON "SecurityLog"("ipAddress");

-- CreateIndex
CREATE INDEX "SecurityLog_severity_idx" ON "SecurityLog"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "IPBlock_ipAddress_key" ON "IPBlock"("ipAddress");

-- CreateIndex
CREATE INDEX "IPBlock_ipAddress_idx" ON "IPBlock"("ipAddress");

-- CreateIndex
CREATE INDEX "IPBlock_expiresAt_idx" ON "IPBlock"("expiresAt");

-- CreateIndex
CREATE INDEX "IPBlock_severity_idx" ON "IPBlock"("severity");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPBlock" ADD CONSTRAINT "IPBlock_blockedBy_fkey" FOREIGN KEY ("blockedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
