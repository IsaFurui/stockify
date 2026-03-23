import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user-controller.js";
import { AuthController } from "../controllers/auth-controller.js";

export async function publicRoutes(app: FastifyInstance) {
	app.post("/user", UserController.create);
	app.post("/auth", AuthController.execute);
}