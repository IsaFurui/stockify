import type { Usuario } from "../../../generated/prisma/browser.js";
import { prisma } from "../../lib/prisma.js";

interface ListUserResponse {
    users: Usuario[]
}

export class ListUserService {
	public static async execute(): Promise<ListUserResponse> {
		const users = await prisma.usuario.findMany();

		return {
			users
		};
	} 
}