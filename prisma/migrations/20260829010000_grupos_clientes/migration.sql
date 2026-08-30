-- Extiende los grupos empresariales a la Base de Clientes (compradores vinculados)
ALTER TABLE "Cliente" ADD COLUMN "grupoId" TEXT;

-- CreateIndex
CREATE INDEX "Cliente_grupoId_idx" ON "Cliente"("grupoId");

-- AddForeignKey (los clientes no se borran al borrar el grupo: quedan sin grupo)
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoEmpresarial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
