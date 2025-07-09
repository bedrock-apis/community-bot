import {dts} from "rolldown-plugin-dts";
import {defineConfig} from "rolldown";

export default defineConfig([
    {
        input: {
            "main":"app/main.ts"
        },
        plugins: [dts({
            isolatedDeclarations: true,
        })],
        external: /^(node:|@|discord-dependless)/,
        output: {
            dir: "dist"
        },
        treeshake: true,
        keepNames: true
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