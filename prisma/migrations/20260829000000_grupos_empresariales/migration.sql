-- CreateTable
CREATE TABLE "GrupoEmpresarial" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreZh" TEXT,
    "empresaPrincipal" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoEmpresarial_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ReporteVerificacion" ADD COLUMN "grupoId" TEXT;

-- CreateIndex
CREATE INDEX "ReporteVerificacion_grupoId_idx" ON "ReporteVerificacion"("grupoId");

-- AddForeignKey
ALTER TABLE "ReporteVerificacion" ADD CONSTRAINT "ReporteVerificacion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoEmpresarial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
