-- CreateTable
CREATE TABLE "ContratoCompra" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "numero" TEXT,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "buyerLegalName" TEXT NOT NULL,
    "buyerTradeName" TEXT,
    "buyerAddress" TEXT,
    "buyerCountry" TEXT NOT NULL DEFAULT 'Venezuela',
    "buyerTaxId" TEXT,
    "buyerRepresentative" TEXT,
    "buyerPosition" TEXT,
    "buyerEmail" TEXT,
    "supplierId" TEXT,
    "supplierLegalName" TEXT NOT NULL,
    "supplierTradeName" TEXT,
    "supplierAddress" TEXT,
    "supplierCountry" TEXT NOT NULL DEFAULT 'People''s Republic of China',
    "supplierUscc" TEXT,
    "supplierLegalRepresentative" TEXT,
    "supplierPosition" TEXT,
    "supplierEmail" TEXT,
    "totalContractValue" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "incoterm" TEXT NOT NULL DEFAULT 'FOB',
    "incotermOther" TEXT,
    "namedPlace" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'T/T',
    "paymentMethodOther" TEXT,
    "productionDays" TEXT,
    "productionStart" TEXT,
    "productionStartDate" TEXT,
    "estimatedReadyToShipDate" TEXT,
    "warrantyMonths" TEXT,
    "warrantyStart" TEXT,
    "warrantyResponseDays" TEXT,
    "warrantyCorrectiveDays" TEXT,
    "delayPercent" TEXT,
    "delayPeriod" TEXT,
    "delayCapPercent" TEXT,
    "delayTerminationDays" TEXT,
    "ncDurationYears" TEXT,
    "ncTerritory" TEXT,
    "governingLaw" TEXT,
    "negotiationDays" TEXT NOT NULL DEFAULT '30',
    "arbitrationInstitution" TEXT,
    "arbitrationSeat" TEXT,
    "arbitrationLanguage" TEXT,
    "arbitrationLanguageOther" TEXT,
    "executedIn" TEXT,
    "controllingLanguage" TEXT,
    "buyerNoticeName" TEXT,
    "buyerNoticeEmail" TEXT,
    "buyerNoticeAddress" TEXT,
    "supplierNoticeName" TEXT,
    "supplierNoticeEmail" TEXT,
    "supplierNoticeAddress" TEXT,
    "buyerSigner" TEXT,
    "buyerSignerPosition" TEXT,
    "buyerSignDate" TEXT,
    "supplierSigner" TEXT,
    "supplierSignerPosition" TEXT,
    "supplierSignDate" TEXT,
    "annexA" JSONB,
    "annexB" JSONB,
    "inspectionCompany" TEXT,
    "inspectionLocation" TEXT,
    "inspectionDate" TEXT,
    "inspectionChecklist" TEXT[],
    "inspectionStandard" TEXT,
    "inspectionStandardOther" TEXT,
    "annexDDocs" TEXT[],
    "annexDOther" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ContratoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoPartida" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "especificacion" TEXT,
    "cantidad" TEXT NOT NULL,
    "precioUnitario" TEXT NOT NULL,
    "total" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContratoPartida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoPago" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "porcentaje" TEXT NOT NULL,
    "monto" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContratoPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContratoCompra_createdAt_idx" ON "ContratoCompra"("createdAt");

-- AddForeignKey
ALTER TABLE "ContratoCompra" ADD CONSTRAINT "ContratoCompra_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoCompra" ADD CONSTRAINT "ContratoCompra_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPartida" ADD CONSTRAINT "ContratoPartida_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPago" ADD CONSTRAINT "ContratoPago_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

