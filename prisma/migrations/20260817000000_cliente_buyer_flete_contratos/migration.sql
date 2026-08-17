-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "nombreComercial" TEXT,
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "representanteLegal" TEXT,
ADD COLUMN     "representanteCargo" TEXT;

-- AlterTable
ALTER TABLE "ContratoCompra" ADD COLUMN     "buyerClientId" TEXT,
ADD COLUMN     "fletePago" TEXT NOT NULL DEFAULT 'porcentaje';

-- AlterTable
ALTER TABLE "ContratoPartida" ADD COLUMN     "esFlete" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ContratoCompra" ADD CONSTRAINT "ContratoCompra_buyerClientId_fkey" FOREIGN KEY ("buyerClientId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
