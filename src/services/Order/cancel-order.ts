import { GrupoUsuario, PedidoStatus, type Pedido } from "../../../generated/prisma/browser.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";

export interface CancelOrderRequest {
    PedId: string
    UserRole: GrupoUsuario
}

export interface CancelOrderResponse {
    message: string
    order: Pedido
}

export class CancelOrderService {
	public static async execute({ PedId, UserRole }: CancelOrderRequest): Promise<CancelOrderResponse> {
		if (UserRole !== GrupoUsuario.ADMIN) {
			throw new AppError("User is not allowed to cancel order!", 401);
		}

		const findOrder = await prisma.pedido.findUnique({ where: { PedId } });

		if (!findOrder) {
			throw new AppError("Order was not found with ID provided!", 404);
		}

		const isOrderPending = findOrder.PedStatus === PedidoStatus.ANDAMENTO;

		if (!isOrderPending) {
			throw new AppError(`The order is with status ${findOrder.PedStatus}, there is not how to cancel it!`, 400);
		}

		const orderCanceled = await prisma.pedido.update({
			where: {
				PedId
			},
			data: {
				PedStatus: PedidoStatus.CANCELADO
			}
		});

		return {
			message: `The order #${PedId} was canceled successfully!`,
			order: orderCanceled
		};
		
	}
}