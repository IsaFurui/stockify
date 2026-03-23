import fastify from "fastify";
import { ErrorHandler } from "./middlewares/error-handler.js";
import { registerRoutes } from "./routes/register-routes.js";
import fastifyJwt from "@fastify/jwt";
import { env } from "./lib/env.js";

const app = fastify();

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	sign: {
		expiresIn: "30m"
	}
});

app.setErrorHandler(ErrorHandler);
app.register(registerRoutes);

app.post("/webhooks/pagamento", async (request, reply) => {
	const payload = request.body;

	console.log("📩 Webhook recebido:", payload);

	// Sempre responda rápido
	return reply.status(200).send({ received: true });
});


export default app;