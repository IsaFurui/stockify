import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { CreateProductService } from "../services/Product/create-product.js";
import { ListProductService } from "../services/Product/list-product.js";

export class ProductController {
	public static async create(req: FastifyRequest, reply: FastifyReply) {
		const createProductSchema = z.object({
			nome: z.string().trim().min(3, "Name must have at least 3 characters"),
			descricao: z.string().trim().min(10, "Description must have at least 10 characters"),
			valor: z.number().min(1)
		});

		const { nome, descricao, valor } = createProductSchema.parse(req.body);

		const createProduct = await CreateProductService.execute({ 
			nome,
			descricao, 
			valor
		});

		return reply.status(201).send(createProduct);
	}

	public static async list(req: FastifyRequest, reply: FastifyReply) {
		const listProductsQuerySchema = z.object({
			ProId: z.string().optional()
		});

		const { ProId } = listProductsQuerySchema.parse(req.query);

		const listProducts = await ListProductService.execute({ ProId });

		return reply.status(200).send(listProducts);
	}
}