import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { AuthService } from "../services/Auth/auth.js";

export class AuthController {
	public static async execute(req: FastifyRequest, reply: FastifyReply) {
		const authSchema = z.object({
			email: z.email().trim(),
			senha: z.string().trim(),
		});

		const { email, senha } = authSchema.parse(req.body);

		const auth = await AuthService.execute({ email, senha });

		const token = await reply.jwtSign(
			{
				role: auth.user.Grupo
			}, {
				sub: auth.user.UsuId,
				expiresIn: "7d"
			}
		);

		return reply.status(200).send({
			...auth,
			token
		});
	}
}