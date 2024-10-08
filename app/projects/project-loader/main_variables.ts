import { BDS_VERSIONS_GIT_FILE, GetGithubContent, uuidv4 } from "../../features";
import { Package } from "../../features/npm";
import { NATIVE_MODULE_NAMES, NPM_MODULES } from "../constants/modules";
import { DynamicVariables } from "./variables-manager";
import * as JSON from "comment-json";
const versions = [
    "stable",
    "preview"
];
const dynamicVariables = new DynamicVariables();
let VARIABLES = Object.setPrototypeOf({}, dynamicVariables) as DynamicVariables;
dynamicVariables.defineVariable$("new.uuid", ()=>uuidv4());
export async function LoadAll(){
    VARIABLES = Object.setPrototypeOf({}, dynamicVariables) as DynamicVariables;
    await Promise.all([
        //buildModuleDynamicVariables().catch(er=>console.error(er)),
        bdsDynamicVariables().catch(er=>console.error(er))
    ]);
}
async function bdsDynamicVariables() {
    const file = await GetGithubContent(BDS_VERSIONS_GIT_FILE);
    if(file){
        const parse = JSON.parse(file.toString()) as any;
        for (const v of versions) {
            const version = parse?.windows?.[v];
            const engine = getEngine(version);
            const engineComplex = JSON.stringify(engine.split(".").map(e=>Number(e)));
            dynamicVariables.defineVariable$(`mc.${v}.engine`, engine, false);
            dynamicVariables.defineVariable$(`mc.${v}.engine-complex`, engineComplex, false);
            dynamicVariables.defineVariable$(`mc.${v}.engine-full`, version, false);
        }
        parse?.windows?.stable;
    }
}
function getEngine(version: string){
    const [ma,mi,v] = version.split(".");
    return `${ma}.${mi}.${v[0] + "0".repeat(v.length - 1)}`;
}
async function buildModuleDynamicVariables(){
    let tasks = [];
    for (const module_name of NATIVE_MODULE_NAMES){
        if(!NPM_MODULES.includes(module_name)) continue;
        let task = Package.Load("@minecraft/"+module_name) as Promise<any>;
        task = task.then(p=>{
            const {name, tags, versions} = p;
            for (const [tag, pVersion] of tags) {
                let text = null;
                switch(tag){
                    case "rc": 
                    case "preview":
                        text = "version.preview";
                        break;
                    case "latest": 
                        text = "version";
                        break;
                    case "beta": 
                        text = "version.preview-experimental";
                    default: break;
                }
                if(text) {
                    const [v1,v2,v3] = pVersion.version.split(".");
                    dynamicVariables.defineVariable$(`module.${module_name}.${text}`, [v1,v2,v3].join("."), false);
                }
            }
            for (const [k, version] of versions){
                if(k.endsWith("-stable")){
                    const [v1,v2,v3] = k.split(".");
                    dynamicVariables.defineVariable$(`module.${module_name}.version-experimental`, [v1,v2,v3].join("."), false);
                    break;
                }
            }
        });
        tasks.push(task);
    } 
    await Promise.all(tasks);
}
export function GET_VARIABLES(){return VARIABLES;}