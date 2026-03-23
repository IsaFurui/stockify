import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { GrupoUsuario } from "../../generated/prisma/enums.js";
import { CreateUserService } from "../services/User/create-user.js";
import { ListUserService } from "../services/User/list-user.js";

export class UserController {
	public static async create(req: FastifyRequest, reply: FastifyReply) {
		const createUserSchema = z.object({
			nome: z.string().trim().min(3, "Name must have at least 3 characters"),
			email: z.email().trim(),
			senha: z.string().trim().min(8, "Password must have at least 8 characters"),
			grupo: z.enum(GrupoUsuario).optional().default(GrupoUsuario.USER)
		});

		const { nome, email, senha, grupo } = createUserSchema.parse(req.body);

		const createUser = await CreateUserService.execute({ nome, email, senha, grupo });

		return reply.status(201).send(createUser);
	}

	public static async list(req: FastifyRequest, reply: FastifyReply) {
		const listUser = await ListUserService.execute();

		return reply.status(200).send(listUser);
	}
}