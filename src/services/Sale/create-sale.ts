import type { VendaProduto } from "../../../generated/prisma/browser.js";
import type { FormaPagamento } from "../../../generated/prisma/enums.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { AddProductsToCartService } from "./add-products-to-cart.js";

export interface ProdutoAInserirNoCarrinho {
    idProduto: string
    quantidade: number,
    desconto: number
}

export interface CreateSaleRequest {
    UsuId: string,
    formaPagamento: FormaPagamento,
    carrinho: ProdutoAInserirNoCarrinho[]
}

export interface CreateSaleResponse {
    message: string,
    cart: VendaProduto[]
}

export class CreateSaleService {
	public static async execute({
		UsuId,
		formaPagamento,
		carrinho
	}: CreateSaleRequest): Promise < CreateSaleResponse > {
		if (carrinho.length === 0) {
			throw new AppError("The cart is empty!", 400);
		}

		// Creating Selling ID
		const createSale = await prisma.venda.create({
			data: {
				UsuId,
				VenValor: 0,
				VenFormaPagamento: formaPagamento
			}
		});

		const { cart } = await AddProductsToCartService.execute({
			VenId: createSale.VenId,
			products: carrinho
		});

		return {
			message: "Sale made successfully!",
			cart
		};
	}
}