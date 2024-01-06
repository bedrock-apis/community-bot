import * as ts from "typescript";
import { DownloadContent, GITHUB_NOT_FOUND_MESSAGE, SafeDownloadContent, getPaths } from "../../features";
import { CONTENT_LOADERS } from "../project-loader";
//import { defualtLib } from "./baselib";
let ready = false;
const libFileName = "lib.d.ts";
const codeFileName = "index.ts";
const externalModuleTypes = [
    "common",
    "server",
    "server-ui",
    "server-net",
    "server-admin",
    "server-gametest",
    "server-editor-bindings"
]
//const filesLike = externalModuleTypes.map(e=>`node_modules/@minecraft/${e}.d.ts`);
const defualtLibs = {
    [libFileName]: "defualtLib" as any
};
class CompilerHostLike implements ts.CompilerHost{
    constructor(fileSource: string){
        const codes: {[k: string]: string} = Object.setPrototypeOf({
            [codeFileName]: fileSource
        }, defualtLibs);
        this.getSourceFile = (fileName: string,e: ts.ScriptTarget | ts.CreateSourceFileOptions)=>{
            if (fileName in codes) return ts.createSourceFile(fileName,codes[fileName],e);
            return undefined;
        }
    }
    writeFile(){}
    readFile(){return undefined as any}
    fileExists(e: string){return e in defualtLibs;}
    getNewLine(){return "\n";}
    getCanonicalFileName(f: string){return f;}
    getCurrentDirectory(){return ""}
    useCaseSensitiveFileNames(){return true;}
    getDefaultLibFileName(){return libFileName;}
    getSourceFile;

}
CONTENT_LOADERS["script_compiler"] = async function load(v,paths){
    const libPath = await SafeDownloadContent(getPaths(paths.join("/"),v["compiler-lib"]).join("/"));
    if(libPath.error || libPath.data?.toString() === GITHUB_NOT_FOUND_MESSAGE) return;
    defualtLibs[libFileName] = libPath.data?.toString("utf-8");
    ready = true;
}
export async function load(){
    const versions = JSON.parse((await DownloadContent("https://api.github.com/repos/Bedrock-APIs/bds-docs/git/trees/c57991078371ec16f460fc706b86547e4be0b6e2")).toString());
    const modulesReferencies: {[k: string]: string} = {};
    for (let {path} of versions.tree) {
        path = path.substring(0,path.length - 5);
        const [name, version] = path.split("_");
        const [branch, tag] = version.split("-");
        if(externalModuleTypes.includes(name) && tag == undefined) modulesReferencies[name] = version;
    }
    const tasks = [];
    const keys = [];
    for (const k of Object.keys(modulesReferencies)) {
        tasks.push(DownloadContent(`https://raw.githubusercontent.com/Bedrock-APIs/bds-docs/preview/script_types/%40minecraft/${k}_${modulesReferencies[k]}.d.ts`));
        keys.push({name:k,versions:modulesReferencies[k]});
    }
    const resolvedModules = {} as any;
    const v = await Promise.all(tasks);
    for (let i = 0; i < v.length; i++) {
        resolvedModules[`node_modules/@minecraft/${keys[i].name}.d.ts`] = v[i].toString(); 
    }
    Object.setPrototypeOf(defualtLibs, resolvedModules);
}
export function compile(code: string){
    const program = ts.createProgram({
        rootNames: [codeFileName],
        options: {
            module: ts.ModuleKind.NodeNext,
            downlevelIteration: true,
            allowJs: true,
            checkJs: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            skipLibCheck:true,
            noImplicitAny: false,
            moduleResolution:ts.ModuleResolutionKind.NodeNext,
            types: [...externalModuleTypes.map(e=>"@minecraft/" + e)]
        },
        host: new CompilerHostLike(code),
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    return diagnostics;
}
export function isRead(){ return ready; }