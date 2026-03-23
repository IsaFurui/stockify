import app from "./app.js";
import { env } from "./lib/env.js";

app.listen({
	port: Number(env.PORT)
}).then(() =>{
	console.info(`🚀 Server running on port ${env.PORT}`);
});