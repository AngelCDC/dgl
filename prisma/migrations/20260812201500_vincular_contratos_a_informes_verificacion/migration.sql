-- DropForeignKey
ALTER TABLE "ContratoCompra" DROP CONSTRAINT "ContratoCompra_supplierId_fkey";

-- AlterTable
ALTER TABLE "ContratoCompra" DROP COLUMN "supplierId",
ADD COLUMN     "verificacionId" TEXT;

-- AddForeignKey
ALTER TABLE "ContratoCompra" ADD CONSTRAINT "ContratoCompra_verificacionId_fkey" FOREIGN KEY ("verificacionId") REFERENCES "ReporteVerificacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

