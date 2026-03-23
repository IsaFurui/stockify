/*
  Warnings:

  - Added the required column `VenDataAtualizacao` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "VenDataAtualizacao" TIMESTAMP(3) NOT NULL;
