import type { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
	try {
		await req.jwtVerify();
	} catch (error) {
		console.error("[authMiddleware]", error);
		return reply.status(401).send({
			message: "Token is not valid!"
		});
	}
}