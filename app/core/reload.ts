import { ReloadVariables } from "./variables";

export function ReloadAll() {
    return Promise.all([
        ReloadVariables()
    ]);
}