import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../error/app-error.js";
import z, { ZodError } from "zod";

export function ErrorHandler(error: Error, req: FastifyRequest, reply: FastifyReply) {
	console.error("[ErrorHandler]", error);

	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: "Error in data validation!",
			data: z.treeifyError(error)
		});
	}

	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			message: error.message
		});
	}

	return reply.status(500).send({
		message: "Internal server error, please try again later!"
	});
}