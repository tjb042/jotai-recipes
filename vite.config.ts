import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        open: true
    },
    test: {
        coverage: {
            provider: "v8"
        },
        environment: "jsdom",
    }
})
