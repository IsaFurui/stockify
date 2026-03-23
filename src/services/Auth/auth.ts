import type { Usuario } from "../../../generated/prisma/client.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { compare } from "bcryptjs";

export interface AuthRequest {
    email: string,
    senha: string
}

export interface AuthResponse {
    status: boolean,
    message: string,
	user: Usuario
}

export class AuthService {
	public static async execute({ email, senha }: AuthRequest): Promise<AuthResponse> {
		const user = await prisma.usuario.findUnique({
			where: { UsuEmail: email }
		});

		if (!user) {
			throw new AppError("Email/password are incorrect!", 404);
		}

		const comparePassword = await compare(senha, user.UsuPasswordHash);

		if (!comparePassword) {
			throw new AppError("Email/password are incorrect!", 404);
		}

		return {
			status: true,
			message: "Login was done successfully!",
			user
		};
	}
}