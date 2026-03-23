import type { Produto } from "../../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";

interface ListProductRequest {
    ProId: string | undefined
}

interface ListProductsResponse {
    message: string,
    products: Produto[]
}

export class ListProductService {
	public static async execute({ ProId }: ListProductRequest): Promise<ListProductsResponse> {
		const products = await prisma.produto.findMany({
			where: {
				...(ProId && { ProId })
			}
		});

		return {
			message: "Products listed successfully!",
			products
		};
	}
}