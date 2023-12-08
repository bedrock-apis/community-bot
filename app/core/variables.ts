import { DownloadContent, SafeDownloadContent, uuidv4 } from "../features";
import { resources, variablesKey } from "../resources";

const hardcodedVariables = {
    get "uuid.new"(){return uuidv4();},
};
export async function ReloadVariables(){
    const vars = Object.setPrototypeOf({},hardcodedVariables);
    let load = 0;
    const staticVars = await SafeDownloadContent("https://raw.githubusercontent.com/Bedrock-APIs/bot-resources/main/static_variables.json");
    try {
        const data = JSON.parse(staticVars.data as any);
        for (const k of Object.getOwnPropertyNames(data)) {
            load++;
            vars[k] = data[k];
        }
        load+=Object.getOwnPropertyNames(hardcodedVariables).length;
    } catch (error) {
        load = -1;
    }
    resources.set(variablesKey,vars);
    return `loaded-variables: ` +  load;
}