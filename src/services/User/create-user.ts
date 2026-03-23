import { hash } from "bcryptjs";
import type { Usuario } from "../../../generated/prisma/browser.js";
import { GrupoUsuario } from "../../../generated/prisma/enums.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";

interface CreateUserRequest {
    nome: string
    email: string
    senha: string
	grupo?: GrupoUsuario
}

interface CreateUserResponse {
    user: Usuario
}

export class CreateUserService {
	public static async execute({ nome, email, senha, grupo }: CreateUserRequest): Promise<CreateUserResponse> {
		const userExists = await prisma.usuario.findUnique({
			where: {
				UsuEmail: email
			}
		});

		if (userExists) {
			throw new AppError("There is an user registered with the email provided!", 400);
		}

		const passwordHash = await hash(senha, 6);

		const user = await prisma.usuario.create({
			data: {
				UsuNome: nome,
				UsuEmail: email,
				UsuPasswordHash: passwordHash,
				Grupo: grupo ?? GrupoUsuario.USER
			}
		});
    
		return {
			user
		};

	}
}