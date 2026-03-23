import { GrupoUsuario, Prisma, type Venda, type VendaProduto } from "../../../generated/prisma/browser.js";
import { AppError } from "../../error/app-error.js";
import { prisma } from "../../lib/prisma.js";

export interface UpdateCartRequest {
    VenId: string
    UsuId: string
    carrinho: VendaProduto[]
}

export interface UpdateCartResponse {
    message: string,
    sale: Venda
}

export class UpdateCartService {
	public static async execute({
		VenId,
		UsuId,
		carrinho
	}: UpdateCartRequest): Promise < UpdateCartResponse > {
		const user = await prisma.usuario.findUnique({
			where: {
				UsuId
			}
		});

		if (!user) {
			throw new AppError("User was not found with ID provided!", 404);
		}

		console.log("venId", VenId);

		const sale = await prisma.venda.findUnique({
			where: {
				VenId
			}
		});

		console.log("sale", sale);

		if (!sale) {
			throw new AppError("Sale was not found with ID provided!", 404);
		}

		const sameUser = sale.UsuId === UsuId;
		const isUserAdmin = user.Grupo === GrupoUsuario.ADMIN;

		if (!sameUser && !isUserAdmin) {
			throw new AppError("The user doesn't have the permission to update the sale!", 401);
		}

		for (const product of carrinho) {
			const productExists = await prisma.vendaProduto.findFirst({
				where: {
					VenId,
					ProId: product.ProId
				}
			});
			const deleteProduct = product.VenpQuantidade === 0;
		
			// Se quantidade for igual a 0, deletar o produto, caso contrário, apenas atualiza-lo
			if (!productExists) {
				const doesProductExists = await prisma.produto.findUnique({
					where: { ProId: product.ProId }
				});

				if (!doesProductExists) {
					throw new AppError("This product is not registered in the system!", 401);
				}

				await prisma.vendaProduto.create({
					data: {
						VenId,
						ProId: product.ProId,
						VenpQuantidade: product.VenpQuantidade,
						VenpPrecoUnitario: product.VenpPrecoUnitario,
						VenpDesconto: new Prisma.Decimal(product.VenpDesconto)
					}
				});
			} else if (deleteProduct) {
				await prisma.vendaProduto.delete({
					where: {
						VenpId: productExists.VenpId
					}
				});
			} else {
				await prisma.vendaProduto.update({
					where: {
						VenpId: product.VenpId
					},
					data: {
						VenpQuantidade: product.VenpQuantidade,
						VenpPrecoUnitario: product.VenpPrecoUnitario
					}
				});
			}
		}

		const newCart = await prisma.vendaProduto.findMany({
			where: { VenId }
		});

		const total = newCart.reduce((a, c) => {
			const subtotal = Number(c.VenpPrecoUnitario) * c.VenpQuantidade;
			const desconto = subtotal * (Number(c.VenpDesconto) / 100);
			return a + (subtotal - desconto);
		}, 0 as number);

		// Updating cart and sale to CONCLUIDO
		const venda = await prisma.venda.update({
			where: {
				VenId: sale.VenId
			},
			data: {
				VenValor: total
			}
		});

		return {
			message: "Sale updated successfully!",
			sale: venda
		};

	}
}