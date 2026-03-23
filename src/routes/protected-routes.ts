import type { FastifyInstance } from "fastify";
import { SaleController } from "../controllers/sale-controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { ProductController } from "../controllers/product-controller.js";
import { UserController } from "../controllers/user-controller.js";
import { OrderController } from "../controllers/order-controller.js";

export async function protectedRoutes(app: FastifyInstance) {
	app.addHook("onRequest", authMiddleware);

	/**
	 * Product Routes
	 */
	app.post("/product", ProductController.create);
	app.get("/product", ProductController.list);

	/**
	 * Sale Routes
	 */
	app.post("/sale", SaleController.create);
	app.get("/sale", SaleController.list);
	app.put("/sale/:VenId", SaleController.updateCart);
	app.put("/sale/add-product/:VenId", SaleController.addProductToCart);
	// app.put("/sale/remove-product/:VenId", SaleController.removeCartProduct);

	/**
	 * User Routes
	 */
	app.get("/user", UserController.list);

	/**
	 * Order Routes
	 */
	app.post("/order", OrderController.create);
	app.get("/order", OrderController.list);
	app.get("/order/cancel/:PedId", OrderController.cancel);

}