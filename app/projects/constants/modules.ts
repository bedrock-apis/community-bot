export const NATIVE_MODULE_NAMES = [
    "common",
    "server",
    "server-ui",
    "server-editor",
    "server-net",
    "server-admin",
    "server-gametest",
    "server-editor-bindings",
    "debug-utilities"
];
export const NPM_MODULES = [
    ...NATIVE_MODULE_NAMES.filter(e=>e!="server-editor-bindings"),
    "vanilla-data",
    "math",
];