-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'both',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB,
    "coverUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "SupplierPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "badgeLabel" TEXT,
    "maxProducts" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "categoryId" TEXT,
    "planId" TEXT,
    "planStart" TIMESTAMP(3),
    "planEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "moq" TEXT,
    "priceRange" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'supplier',
    "supplierId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudProcura" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "empresaCliente" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "ciudad" TEXT,
    "direccion" TEXT,
    "objetivoReunion" TEXT NOT NULL,
    "resumenCliente" TEXT,
    "sectorIndustria" TEXT,
    "canalComercializacion" TEXT,
    "fortalezasDetectadas" TEXT[],
    "restriccionesDetectadas" TEXT[],
    "comentariosFinales" TEXT,
    "proximosPasos" TEXT[],
    "elaboradoPorNombre" TEXT NOT NULL,
    "elaboradoPorCargo" TEXT,
    "elaboradoPorFecha" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudProcura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactoProcura" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "ContactoProcura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoProcura" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcionGeneral" TEXT NOT NULL,
    "caracteristicasPrincipales" TEXT[],
    "presentaciones" TEXT[],
    "materiales" TEXT[],
    "colores" TEXT[],
    "dimensiones" TEXT,
    "peso" TEXT,
    "empaque" TEXT,
    "marca" TEXT,
    "referenciaModelo" TEXT,
    "paisOrigen" TEXT,
    "usosAplicaciones" TEXT,
    "requerimientosEspeciales" TEXT,
    "observaciones" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductoProcura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NecesidadProcura" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "productoRelacionado" TEXT NOT NULL,
    "tipoNecesidad" TEXT NOT NULL,
    "tipoNecesidadOtro" TEXT,
    "descripcion" TEXT NOT NULL,
    "especificacionesMinimas" TEXT,
    "frecuenciaRequerida" TEXT,
    "cantidadReferencial" TEXT,
    "prioridad" TEXT,
    "observaciones" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NecesidadProcura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudAdquisicion" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "tipoDocumento" TEXT,
    "tipoDocumentoOtro" TEXT,
    "solicitante" TEXT NOT NULL,
    "ccNit" TEXT NOT NULL,
    "telCel" TEXT,
    "ext" TEXT,
    "email" TEXT NOT NULL,
    "descripcionNecesidad" TEXT NOT NULL,
    "pertinencia" TEXT,
    "descripcionObjeto" TEXT NOT NULL,
    "especificaciones" TEXT,
    "requierePermisos" TEXT,
    "obligaciones" TEXT[],
    "modalidad" TEXT NOT NULL,
    "justificacionModalidad" TEXT NOT NULL,
    "valorEstimado" TEXT NOT NULL,
    "formaPago" TEXT,
    "detallePago" TEXT,
    "criterioMenorPrecio" BOOLEAN NOT NULL DEFAULT true,
    "criterioOtro" TEXT,
    "contratistaNombre" TEXT,
    "contratistaCcNit" TEXT,
    "contratistaEmail" TEXT,
    "contratistaCiudad" TEXT,
    "contratistaTelefono" TEXT,
    "plazo" TEXT NOT NULL,
    "comiteEvaluador" TEXT[],
    "elaboradoPorNombre" TEXT,
    "elaboradoPorCargo" TEXT,
    "elaboradoPorFecha" TEXT,
    "contratanteNombre" TEXT,
    "contratanteCargo" TEXT,
    "contratanteFecha" TEXT,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solicitudProcuraId" TEXT,

    CONSTRAINT "SolicitudAdquisicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizanteAdquisicion" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "productoNombre" TEXT,
    "nombre" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CotizanteAdquisicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiesgoAdquisicion" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "mitigacion" TEXT,
    "asignacion" TEXT NOT NULL DEFAULT 'Contratante',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RiesgoAdquisicion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudAdquisicion_solicitudProcuraId_key" ON "SolicitudAdquisicion"("solicitudProcuraId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SupplierPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactoProcura" ADD CONSTRAINT "ContactoProcura_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudProcura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoProcura" ADD CONSTRAINT "ProductoProcura_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudProcura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NecesidadProcura" ADD CONSTRAINT "NecesidadProcura_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudProcura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAdquisicion" ADD CONSTRAINT "SolicitudAdquisicion_solicitudProcuraId_fkey" FOREIGN KEY ("solicitudProcuraId") REFERENCES "SolicitudProcura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizanteAdquisicion" ADD CONSTRAINT "CotizanteAdquisicion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudAdquisicion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiesgoAdquisicion" ADD CONSTRAINT "RiesgoAdquisicion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudAdquisicion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
