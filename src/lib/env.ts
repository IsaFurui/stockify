import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
	PORT: z.coerce.number().default(3030),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string()
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("❌ Variáveis de ambiente não foram configuradas corretamente: ", z.treeifyError(_env.error));

	throw new Error("❌ Variáveis de ambiente não foram configuradas corretamente!");
}

export const env = _env.data;