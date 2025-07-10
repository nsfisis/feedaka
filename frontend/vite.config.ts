import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/graphql": {
				target: "http://localhost:8080",
				changeOrigin: true,
			},
		},
		hmr: {
			overlay: true,
		},
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "development",
		),
	},
});
