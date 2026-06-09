import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/auth": { target: "http://localhost:8000", changeOrigin: true },
            "/me": { target: "http://localhost:8000", changeOrigin: true },
            "^/operator/": {
                target: "http://localhost:8000",
                changeOrigin: true,
                bypass: (req) =>
                    req.headers.accept?.includes("text/html")
                        ? "/index.html"
                        : undefined,
            },
            "^/admin/": {
                target: "http://localhost:8000",
                changeOrigin: true,
                bypass: (req) =>
                    req.headers.accept?.includes("text/html")
                        ? "/index.html"
                        : undefined,
            },
        },
    },
});
