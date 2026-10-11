import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    base: "/legal-practice-management/",
    build: {
        sourcemap: false,
    },
    plugins: [react()],
});
