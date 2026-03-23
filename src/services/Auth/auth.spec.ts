import {  describe, expect, it } from "vitest";
import { MakeUser } from "../../factories/make-user.js";
import { hash } from "bcryptjs";
import { AuthService } from "./auth.js";

describe("Auth", () => {
	it("should authenticate a user with valid credentials", async () => {
		const password = "password123";

		// Create a random user with a known password
		const user = await MakeUser({
			UsuPasswordHash: await hash(password, 6)
		});
        
		const response = await AuthService.execute({
			email: user.UsuEmail,
			senha: password
		});

		console.log("response", response);

		expect(response.status).toBe(true);
        
	});
});