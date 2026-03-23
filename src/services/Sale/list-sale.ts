import { GrupoUsuario, type FormaPagamento, type VendaStatus } from "../../../generated/prisma/enums.js";
import type { Decimal } from "../../../generated/prisma/internal/prismaNamespace.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";

export interface ListSaleRequest {
    VenId: string | undefined
    UsuId: string | undefined
    UsuId_Solicitante: string
    UserRole: GrupoUsuario
}

export interface ListSaleResponse {
    message: string,
    cart: {
        VenId: string;
        UsuId: string;
        VenDataCriacao: Date;
        VenValor: Decimal;
        VenFormaPagamento: FormaPagamento | null;
        VenStatus: VendaStatus;
        vendaProdutos: {
            VenpId: string;
            VenId: string;
            ProId: string;
            VenpQuantidade: number;
            VenpPrecoUnitario: Decimal;
            VenpDesconto: Decimal;
        }[];
    }[];
}

export class ListSaleService {
	public static async execute({
		VenId,
		UsuId,
		UsuId_Solicitante,
		UserRole
	}: ListSaleRequest): Promise < ListSaleResponse > {

		let cart = [];
		if (UsuId) {
			const isUserAdmin = UserRole === GrupoUsuario.ADMIN;
			const isUserLookingHisUsuId = UsuId === UsuId_Solicitante;

			if (!isUserAdmin && !isUserLookingHisUsuId) {
				throw new AppError("User doesn't have the permission to list the sale", 401);
			}

			cart = await prisma.venda.findMany({
				where: {
					UsuId
				},
				include: {
					vendaProdutos: true
				}
			});

		} else {
			cart = await prisma.venda.findMany({
				where: {
					...(VenId && {
						VenId
					})
				},
				include: {
					vendaProdutos: true
				}
			});
		}

		return {
			message: "Sales listed successfully!",
			cart
		};
	}
}