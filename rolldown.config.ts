import {defineConfig} from "rolldown";

export default defineConfig([
    {
        input: "app/index.ts",
        external: [
            /node:/
        ],
        platform:"node",
        output: {
            file: "dist/main.js",
            minify: true,
            comments: "none"
        },
        treeshake: true
    },
    {
        input: "test.ts",
        external: [
            /node:/
        ],
        platform:"node",
        output: {
            file: "dist/test.js",
            minify: true,
        },
        treeshake: true,
    }
]);