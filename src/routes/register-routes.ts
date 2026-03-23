import type { FastifyInstance } from "fastify";
import { publicRoutes } from "./public-routes.js";
import { protectedRoutes } from "./protected-routes.js";

export async function registerRoutes(app: FastifyInstance) {
	await app.register(publicRoutes);
	await app.register(protectedRoutes);
	// await app.register(protectedRoutes);
}