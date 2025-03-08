-- CreateTable
CREATE TABLE "market_documents" (
    "id" TEXT NOT NULL,
    "mRID" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "processType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reasonCode" TEXT,

    CONSTRAINT "market_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_series" (
    "id" TEXT NOT NULL,
    "mRID" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "biddingZone" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "curveType" TEXT NOT NULL,
    "resourceMRID" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "resourceLocation" TEXT,
    "resourceType" TEXT,
    "powerSystemMRID" TEXT,
    "powerSystemName" TEXT,
    "nominalPower" DOUBLE PRECISION,
    "nominalPowerUnit" TEXT,
    "market_document_id" TEXT NOT NULL,

    CONSTRAINT "time_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "available_periods" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "resolution" TEXT NOT NULL,
    "time_series_id" TEXT NOT NULL,

    CONSTRAINT "available_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "available_period_id" TEXT NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_documents_mRID_key" ON "market_documents"("mRID");

-- CreateIndex
CREATE INDEX "market_documents_startTime_endTime_idx" ON "market_documents"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "time_series_startTime_endTime_idx" ON "time_series"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "time_series_resourceName_idx" ON "time_series"("resourceName");

-- CreateIndex
CREATE INDEX "time_series_resourceLocation_idx" ON "time_series"("resourceLocation");

-- CreateIndex
CREATE INDEX "available_periods_startTime_endTime_idx" ON "available_periods"("startTime", "endTime");

-- AddForeignKey
ALTER TABLE "time_series" ADD CONSTRAINT "time_series_market_document_id_fkey" FOREIGN KEY ("market_document_id") REFERENCES "market_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "available_periods" ADD CONSTRAINT "available_periods_time_series_id_fkey" FOREIGN KEY ("time_series_id") REFERENCES "time_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_available_period_id_fkey" FOREIGN KEY ("available_period_id") REFERENCES "available_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
