import { CleanUp, Download, subdownload } from "./download";
import child_p from "child_process"; 
import fs, {promises} from "fs";

class ModuleLoaded{
    
}
class ModuleVersion{
    readonly name;
    readonly version;
    readonly tag: string | undefined;
    constructor(fileName: string){
        if(!fileName.endsWith(".json")) throw new TypeError("Invalid no JSON Module");
        const [name,version] = fileName.substring(0,fileName.length-".json".length).split("_");
        this.name = name;
        this.version = version;
        this.tag = version.split("-")[1];
    }
    Load(){

    }
}
class ModuleManager{
    private moduleVersions;
    constructor(){
        this.moduleVersions = new Map<string,Map<string,ModuleVersion>>()
    }
    addVersion(module: ModuleVersion){
        if(!this.moduleVersions.has(module.name)) this.moduleVersions.set(module.name,new Map());
        const versions = this.moduleVersions.get(module.name);
        versions?.set(module.version,module);
    }
    getModuleVersion(name: string, version: string): ModuleVersion | undefined{
        return this.moduleVersions.get(name)?.get(version);
    }
    getModuleVersions(name: string){
        return [...(this.moduleVersions.get(name)?.values()??[])];
    }
    getModuleVersionsNames(name: string){
        return [...(this.moduleVersions.get(name)?.keys()??[])];
    }
}
function* RecursiveFiles(base: string, dirs: string[] = []): Generator<string>{
    for(const file of fs.readdirSync(base,{withFileTypes:true}))
        if(file.isFile()) yield [...dirs,file.name].join("/");
        else if(file.isDirectory()) yield* RecursiveFiles(base + "/" + file.name,[...dirs,file.name]);
}

console.log("Donwloading");
const moduleManager = new ModuleManager();
for(const file of RecursiveFiles([subdownload,"docs","script_modules"].join("/")))
    if(file.endsWith(".json")) moduleManager.addVersion(new ModuleVersion(file));
console.log(moduleManager.getModuleVersionsNames("@minecraft/server"));
/*
Download("1.20.40.20","win",true).then(async ()=>{
    console.log("Executing");
    await fs.promises.writeFile([subdownload,"test_config.json"].join("\\"),JSON.stringify({
        generate_documentation: true
    }));
    return new Promise(res=>child_p.exec("call \"" + [subdownload,"bedrock_server.exe"].join("/")+'"',{windowsHide:true},(er)=>er?console.error(er):null).on("exit",res));
}).then((exitCode)=>{
    if(!exitCode){
        for(const file of fs.readdirSync([subdownload,"docs","script_modules","@minecraft"].join("/"),{withFileTypes:true}))
            if(file.isFile()) console.log(...file.name.split("_"));
    }
}).catch(er=>console.error(er,er.stack)).finally(CleanUp).then(()=>console.log("done"));
*/