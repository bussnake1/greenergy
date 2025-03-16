-- CreateTable
CREATE TABLE "unavailability_pg_market_documents" (
    "id" TEXT NOT NULL,
    "mRID" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "processType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reasonCode" TEXT,

    CONSTRAINT "unavailability_pg_market_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unavailability_pg_time_series" (
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
    "unavailability_pg_market_document_id" TEXT NOT NULL,

    CONSTRAINT "unavailability_pg_time_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unavailability_pg_available_periods" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "resolution" TEXT NOT NULL,
    "unavailability_pg_time_series_id" TEXT NOT NULL,

    CONSTRAINT "unavailability_pg_available_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unavailability_pg_points" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unavailability_pg_available_period_id" TEXT NOT NULL,

    CONSTRAINT "unavailability_pg_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unavailability_pg_market_documents_mRID_key" ON "unavailability_pg_market_documents"("mRID");

-- CreateIndex
CREATE INDEX "unavailability_pg_market_documents_startTime_endTime_idx" ON "unavailability_pg_market_documents"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "unavailability_pg_time_series_startTime_endTime_idx" ON "unavailability_pg_time_series"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "unavailability_pg_time_series_resourceName_idx" ON "unavailability_pg_time_series"("resourceName");

-- CreateIndex
CREATE INDEX "unavailability_pg_time_series_resourceLocation_idx" ON "unavailability_pg_time_series"("resourceLocation");

-- CreateIndex
CREATE INDEX "unavailability_pg_available_periods_startTime_endTime_idx" ON "unavailability_pg_available_periods"("startTime", "endTime");

-- AddForeignKey
ALTER TABLE "unavailability_pg_time_series" ADD CONSTRAINT "unavailability_pg_time_series_unavailability_pg_market_doc_fkey" FOREIGN KEY ("unavailability_pg_market_document_id") REFERENCES "unavailability_pg_market_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unavailability_pg_available_periods" ADD CONSTRAINT "unavailability_pg_available_periods_unavailability_pg_time_fkey" FOREIGN KEY ("unavailability_pg_time_series_id") REFERENCES "unavailability_pg_time_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unavailability_pg_points" ADD CONSTRAINT "unavailability_pg_points_unavailability_pg_available_perio_fkey" FOREIGN KEY ("unavailability_pg_available_period_id") REFERENCES "unavailability_pg_available_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
