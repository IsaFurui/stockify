import { Prisma, TipoMovimento, VendaStatus, type VendaProduto } from "../../../generated/prisma/browser.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { ProdutoAInserirNoCarrinho } from "./create-sale.js";

export interface AddProductToSaleRequest {
    VenId: string,
    products: ProdutoAInserirNoCarrinho[]
}

export interface AddProductToSaleResponse {
    message: string,
    cart: VendaProduto[]
}

export class AddProductsToCartService {
	public static async execute({
		VenId,
		products
	}: AddProductToSaleRequest): Promise < AddProductToSaleResponse > {
		const sale = await prisma.venda.findFirst({
			where: {
				VenId
			}
		});

		if (!sale) {
			throw new AppError("Sale was not found with ID provided!", 404);
		}

		const cart = [];
		for (const product of products) {
			const findProduct = await prisma.produto.findUnique({
				where: {
					ProId: product.idProduto
				}
			});

			if (!findProduct) {
				throw new AppError("The product was not found with ID provided!", 404);
			}

			// Adding products to the cart
			await prisma.vendaProduto.create({
				data: {
					VenId,
					ProId: findProduct.ProId,
					VenpQuantidade: product.quantidade,
					VenpPrecoUnitario: findProduct.ProValor,
					VenpDesconto: new Prisma.Decimal(product.desconto)
				}
			});

			// Atualizar estoque
			await prisma.estoque.create({
				data: {
					ProId: findProduct.ProId,
					MovTipo: TipoMovimento.SAIDA,
					MovQuantidade: product.quantidade,
					VenId: sale.VenId
				}
			});

			cart.push({
				VenId,
				ProId: findProduct.ProId,
				VenpQuantidade: product.quantidade,
				VenpPrecoUnitario: Number(findProduct.ProValor),
				VenpDesconto: product.desconto
			});
		}

		const newCart = await prisma.vendaProduto.findMany({
			where: { VenId }
		});

		const total = newCart.reduce((a, c) => {
			const subtotal = Number(c.VenpPrecoUnitario) * c.VenpQuantidade;
			const desconto = subtotal * (Number(c.VenpDesconto) / 100);
			return a + (subtotal - desconto);
		}, 0 as number);


		// Updating cart and sale to CONCLUIDO
		await prisma.venda.update({
			where: {
				VenId
			},
			data: {
				VenValor: new Prisma.Decimal(total),
				VenStatus: VendaStatus.CONCLUIDO
			}
		});

		return {
			message: "Products were added successfully!",
			cart: newCart
		};
	}
}