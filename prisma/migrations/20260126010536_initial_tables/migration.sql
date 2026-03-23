-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'DEBITO', 'CREDITO');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('CONCLUIDO', 'ANDAMENTO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "VendaStatus" AS ENUM ('CONCLUIDO', 'CANCELADO', 'ESTORNADO', 'ANDAMENTO');

-- CreateEnum
CREATE TYPE "GrupoUsuario" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Produto" (
    "ProId" TEXT NOT NULL,
    "ProNome" TEXT NOT NULL,
    "ProDescricao" TEXT NOT NULL,
    "ProValor" DECIMAL(10,2) NOT NULL,
    "ProQtdeEstoque" INTEGER NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("ProId")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "UsuId" TEXT NOT NULL,
    "UsuNome" TEXT NOT NULL,
    "UsuEmail" TEXT NOT NULL,
    "UsuPasswordHash" TEXT NOT NULL,
    "UsuDataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Grupo" "GrupoUsuario" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("UsuId")
);

-- CreateTable
CREATE TABLE "Venda" (
    "VenId" TEXT NOT NULL,
    "UsuId" TEXT NOT NULL,
    "VenDataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "VenValor" DECIMAL(10,2) NOT NULL,
    "VenFormaPagamento" "FormaPagamento",
    "VenStatus" "VendaStatus" NOT NULL DEFAULT 'ANDAMENTO',

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("VenId")
);

-- CreateTable
CREATE TABLE "VendaProduto" (
    "VenpId" TEXT NOT NULL,
    "VenId" TEXT NOT NULL,
    "ProId" TEXT NOT NULL,
    "VenpQuantidade" INTEGER NOT NULL DEFAULT 1,
    "VenpPrecoUnitario" DECIMAL(10,2) NOT NULL,
    "VenpDesconto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VendaProduto_pkey" PRIMARY KEY ("VenpId")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "PedId" TEXT NOT NULL,
    "UsuId" TEXT NOT NULL,
    "PedDataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PedDataEntrega" TIMESTAMP(3),
    "PedStatus" "PedidoStatus" NOT NULL DEFAULT 'ANDAMENTO',

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("PedId")
);

-- CreateTable
CREATE TABLE "PedidoProduto" (
    "PedpId" TEXT NOT NULL,
    "PedId" TEXT NOT NULL,
    "ProId" TEXT NOT NULL,
    "PedpQtde" INTEGER NOT NULL,
    "PedpPrecoUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PedidoProduto_pkey" PRIMARY KEY ("PedpId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_UsuEmail_key" ON "Usuario"("UsuEmail");

-- CreateIndex
CREATE UNIQUE INDEX "VendaProduto_VenId_ProId_key" ON "VendaProduto"("VenId", "ProId");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_UsuId_fkey" FOREIGN KEY ("UsuId") REFERENCES "Usuario"("UsuId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaProduto" ADD CONSTRAINT "VendaProduto_ProId_fkey" FOREIGN KEY ("ProId") REFERENCES "Produto"("ProId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaProduto" ADD CONSTRAINT "VendaProduto_VenId_fkey" FOREIGN KEY ("VenId") REFERENCES "Venda"("VenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_UsuId_fkey" FOREIGN KEY ("UsuId") REFERENCES "Usuario"("UsuId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoProduto" ADD CONSTRAINT "PedidoProduto_ProId_fkey" FOREIGN KEY ("ProId") REFERENCES "Produto"("ProId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoProduto" ADD CONSTRAINT "PedidoProduto_PedId_fkey" FOREIGN KEY ("PedId") REFERENCES "Pedido"("PedId") ON DELETE RESTRICT ON UPDATE CASCADE;
