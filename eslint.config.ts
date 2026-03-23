import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
	js.configs.recommended,
	...ts.configs.recommended,
	{
		files: ["**/*.{ts,js}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node, // adiciona objetos globais do Node (process, __dirname etc)
				window: "readonly",
				document: "readonly",
				console: "readonly",
			},
		},
		rules: {
			"no-console": "off",
			indent: ["error", "tab", { "SwitchCase": 1 }],
			semi: ["error", "always"],
			quotes: ["error", "double"],
			"preserve-caught-error": "error",
		},
	},
	tseslint.configs.recommended,
]);
