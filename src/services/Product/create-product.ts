import type { Produto } from "../../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";

interface CreateProductRequest {
    nome: string,
    descricao: string
    valor: number
}

interface CreateProductResponse {
    message: string,
    product: Produto
}

export class CreateProductService {
	public static async execute({ nome, descricao, valor }: CreateProductRequest): Promise<CreateProductResponse> {
		const product = await prisma.produto.create({
			data: {
				ProNome: nome,
				ProDescricao: descricao,
				ProValor: valor
			}
		});

		return {
			message: "Product created successfully!",
			product
		};
	}
}