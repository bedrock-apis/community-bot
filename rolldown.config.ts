import {defineConfig} from "rolldown";

export default defineConfig([
    {
        input: "app/main.ts",
        external: [
            /node:/
        ],
        platform:"node",
        output: {
            file: "dist/main.js",
            minify: true,
        },
        treeshake: true
    }
]);