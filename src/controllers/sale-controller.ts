import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { FormaPagamento } from "../../generated/prisma/enums.js";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { CreateSaleService } from "../services/Sale/create-sale.js";
import { ListSaleService } from "../services/Sale/list-sale.js";
import { UpdateCartService } from "../services/Sale/update-cart.js";
import { AddProductsToCartService } from "../services/Sale/add-products-to-cart.js";

export class SaleController {
	public static async create(req: FastifyRequest, reply: FastifyReply) {
		const cartSchema = z.object({
			idProduto: z.string(),
			quantidade: z.number().default(1),
			desconto: z.number().default(0)
		});

		const createSaleSchema = z.object({
			formaPagamento: z.enum(FormaPagamento),
			carrinho: z.array(cartSchema)
		});

		const { formaPagamento, carrinho } = createSaleSchema.parse(req.body);

		const createSale = await CreateSaleService.execute({ 
			UsuId: req.user.sub, 
			formaPagamento, 
			carrinho 
		});

		return reply.status(201).send(createSale);
	}

	public static async list(req: FastifyRequest, reply: FastifyReply) {
		const listSaleQuerySchema = z.object({
			VenId: z.string().optional(),
			UsuId: z.string().optional()
		});

		const { VenId, UsuId } = listSaleQuerySchema.parse(req.query);

		const listSale = await ListSaleService.execute({ 
			VenId,
			UsuId,
			UsuId_Solicitante: req.user.sub,
			UserRole: req.user.role
		});

		return reply.status(200).send(listSale);
	}

	public static async updateCart(req: FastifyRequest, reply: FastifyReply) {
		const produtoCarrinhoSchema = z.object({
			VenpId: z.string(),
			VenId: z.string(),
			ProId: z.string(),
			VenpQuantidade: z.number().default(1),
			VenpPrecoUnitario: z.coerce.number().positive().default(0),
			VenpDesconto: z.coerce.number().default(0)
		});

		const updateSaleSchema = z.object({
			carrinho: z.array(produtoCarrinhoSchema)
		});

		const { carrinho } = updateSaleSchema.parse(req.body);

		const updateSaleParamsSchema = z.object({
			VenId: z.string()
		});

		const { VenId } = updateSaleParamsSchema.parse(req.params);

		const carrinhoFormatado = carrinho.map(item => ({
			...item,
			VenpPrecoUnitario: new Decimal(item.VenpPrecoUnitario),
			VenpDesconto: new Decimal(item.VenpDesconto)
		}));

		const updateSale = await UpdateCartService.execute({ 
			VenId, 
			UsuId: req.user.sub, 
			carrinho: carrinhoFormatado 
		});

		return reply.status(200).send(updateSale);
	}

	public static async addProductToCart(req: FastifyRequest, reply: FastifyReply) {
		const cartSchema = z.object({
			idProduto: z.string(),
			quantidade: z.number().default(1),
			desconto: z.number().default(0)
		});

		const addProductToCartSchema = z.object({
			carrinho: z.array(cartSchema)
		});

		const { carrinho } = addProductToCartSchema.parse(req.body);
		
		const addProductToCartQuerySchema = z.object({
			VenId: z.string()
		});
		
		const { VenId } = addProductToCartQuerySchema.parse(req.params);

		const addProducts = await AddProductsToCartService.execute({ 
			VenId, 
			products: carrinho 
		});

		return reply.status(200).send(addProducts);
	}

}