import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	schema: "src/graphql/schema.graphql",
	documents: ["src/graphql/*.graphql"],
	generates: {
		"src/graphql/generated/": {
			preset: "client",
			plugins: [],
			config: {
				enumsAsTypes: true,
				skipTypename: true,
				useTypeImports: true,
				scalars: {
					DateTime: "string",
				},
			},
		},
	},
};

export default config;
