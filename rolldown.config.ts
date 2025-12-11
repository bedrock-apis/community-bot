import { dts } from "rolldown-plugin-dts";
import { defineConfig } from "rolldown";

export default defineConfig([
    {
        input: {
            "main": "app/main.ts"
        },
        plugins: [dts({
            oxc: true,
        })],
        external: /^(node:|@|discord-dependless)/,
        output: {
            dir: "dist",
            keepNames: true,
            cleanDir: true
        },
        treeshake: true
    },
    {
        input: "tests/base.ts",
        external: [
            /^(node:|@)/
        ],
        output: {
            file: "tests/dist/test.js"
        },
        treeshake: true
    }
]);