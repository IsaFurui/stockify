import { GrupoUsuario, type Pedido } from "../../../generated/prisma/browser.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";

export interface Order {
    produtoId: string,
    quantidade: number
}

interface CreateOrderRequest {
    UsuId: string,
    pedido: Order[]
}

interface CreateOrderResponse {
    message: string
    order: Pedido
}

export class CreateOrderService {
	public static async execute({ UsuId, pedido }: CreateOrderRequest): Promise<CreateOrderResponse> {
		const isUserAdmin = await prisma.usuario.findFirst({
			where: { 
				UsuId,
				Grupo: GrupoUsuario.ADMIN 
			}
		});
    
		if (!isUserAdmin) {
			throw new AppError("User is not allowed to make orders, please contact a Admin", 401);
		}
    
		const createOrder = await prisma.pedido.create({
			data: {
				UsuId
			}
		});
    
		for (const product of pedido) {
			const doesProductExists = await prisma.produto.findFirst({
				where: { ProId: product.produtoId }
			});
    
			if (!doesProductExists) {
				throw new AppError(`The product with ID ${product.produtoId} was not found!`, 404);
			}
    
			// Teria que criar um endpoint para enviar o pedido para outro lugar?
    
			await prisma.pedidoProduto.create({
				data: {
					PedId: createOrder.PedId,
					ProId: product.produtoId,
					PedpQtde: product.quantidade,
					PedpPrecoUnitario: doesProductExists.ProValor
				}
			});
		}
    
		return {
			message: "Order was created successfully! Awaiting data of delivery of the company!",
			order: createOrder
		};
	}
}