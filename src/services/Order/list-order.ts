import type { Pedido } from "../../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";

interface ListOrderRequest {
    PedId: string | undefined
}

interface ListOrderResponse {
    message: string
    orders: Pedido[]
}

export class ListOrderService {
	public static async execute({
		PedId
	}: ListOrderRequest): Promise <ListOrderResponse> {
		const order = await prisma.pedido.findMany({
			where: {
				...(PedId && {
					PedId
				})
			},
			include: {
				pedidoProdutos: true
			}
		});
	
	
		return {
			message: "Sales listed successfully!",
			orders: order
		};
	}
}