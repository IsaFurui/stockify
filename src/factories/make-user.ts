import { faker } from "@faker-js/faker";
import type { Usuario } from "../../generated/prisma/browser.js";
import { prisma } from "../lib/prisma.js";

export async function MakeUser(override?: Partial<Usuario>): Promise<Usuario> {
	return await prisma.usuario.create({
		data: {
			UsuId: faker.string.uuid(),
			UsuNome: faker.person.fullName(),
			UsuEmail: faker.internet.email(),
			UsuPasswordHash: faker.internet.password(),
			...override,
		}
	});    
}