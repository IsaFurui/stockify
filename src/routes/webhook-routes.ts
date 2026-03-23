import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.js";
import { OrderController } from "../controllers/order-controller.js";

export async function protectedRoutes(app: FastifyInstance) {
	app.addHook("onRequest", authMiddleware);

	app.get("/webhook/", OrderController.cancel);

}