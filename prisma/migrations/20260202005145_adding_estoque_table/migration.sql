-- CreateEnum
CREATE TYPE "TipoMovimento" AS ENUM ('ENTRADA', 'SAIDA', 'ESTORNO', 'AJUSTE');

-- CreateTable
CREATE TABLE "Estoque" (
    "MovId" TEXT NOT NULL,
    "ProId" TEXT NOT NULL,
    "MovTipo" "TipoMovimento" NOT NULL,
    "MovQuantidade" INTEGER NOT NULL,
    "MovData" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "VenId" TEXT,
    "PedId" TEXT,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("MovId")
);

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_ProId_fkey" FOREIGN KEY ("ProId") REFERENCES "Produto"("ProId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_VenId_fkey" FOREIGN KEY ("VenId") REFERENCES "Venda"("VenId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_PedId_fkey" FOREIGN KEY ("PedId") REFERENCES "Pedido"("PedId") ON DELETE SET NULL ON UPDATE CASCADE;
