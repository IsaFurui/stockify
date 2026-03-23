import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { CreateOrderService } from "../services/Order/create-order.js";
import { ListOrderService } from "../services/Order/list-order.js";
import { CancelOrderService } from "../services/Order/cancel-order.js";

export class OrderController {
	public static async create(req: FastifyRequest, reply: FastifyReply) {
		const order = z.object({
			produtoId: z.string(),
			quantidade: z.number().min(1)
		});

		const createOrderSchema = z.object({
			pedido: z.array(order)
		});

		const { pedido } = createOrderSchema.parse(req.body);

		const createOrder = await CreateOrderService.execute({
			UsuId: req.user.sub,
			pedido
		});

		return reply.status(200).send(createOrder);
	}

	public static async list(req: FastifyRequest, reply: FastifyReply) {
		const listOrderQuerySchema = z.object({
			PedId: z.string().optional()
		});
	
		const { PedId } = listOrderQuerySchema.parse(req.query);
	
		const listOrder = await ListOrderService.execute({ PedId });
	
		return reply.status(200).send(listOrder);
	}

	public static async cancel(req: FastifyRequest, reply: FastifyReply) {
		const cancelOrderQuerySchema = z.object({
			PedId: z.string()
		});
	
		const { PedId } = cancelOrderQuerySchema.parse(req.params);
	
		const cancelOrder = await CancelOrderService.execute({ 
			PedId,
			UserRole: req.user.role
		});
	
		return reply.status(200).send(cancelOrder);
	}
}