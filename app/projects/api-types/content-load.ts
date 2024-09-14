import { SafeDownloadContent } from "../../features";
import { BDS_DOCS_REPO } from "../constants";
import { PRE_LOAD, RESOURCES } from "../project-loader";
import * as JSON from "comment-json";

const prefix = "@minecraft/";

PRE_LOAD.subscribe(async ()=>{
    const [all, pV, pT, obj] = await GetMainVersions(BDS_DOCS_REPO + "/preview/exist.json");
    const [all2, sV, sT] = await GetMainVersions(BDS_DOCS_REPO + "/stable/exist.json");
    for(const name of Object.keys(all)){
        const n = all[name].name;
        RESOURCES.VARIABLES["module." + n + ".name"] = all[name].fullName;
        RESOURCES.VARIABLES["module." + n + ".uuid"] = obj[all[name].fullName].uuid;
        RESOURCES.VARIABLES["module." + n + ".version"] = (sV[name]??pV[name]??pT[name]).fullVersion;
        RESOURCES.VARIABLES["module." + n + ".version.preview"] = (pV[name]??pT[name]).fullVersion;
        RESOURCES.VARIABLES["module." + n + ".version-experimental"] = (sT[name]??pT[name]??pV[name]).fullVersion;
        RESOURCES.VARIABLES["module." + n + ".version.preview-experimental"] = (pT[name]??pV[name]).fullVersion;
    }
});

async function GetMainVersions(existJson: string) {
    const data = await SafeDownloadContent(existJson);
    if(data.error) console.error(data.error);
    const raw = JSON.parse(data.data?.toString("utf8")!) as any;
    const versions: any = {};
    const tags: any = {};
    const all: any = {};
    for(const path of raw.script_modules){
        if(path.startsWith(prefix) && !path.includes("internal")) {
            const p = new PackageVersion(path);
            if(p.tag) {
                tags[p.name] = p;
                if(!(p.name in all)) all[p.name] = p;
                continue;
            }
            let c = versions[p.name];
            if(c) if(c && compareVersions(c.version, p.version) < 0) c = p;
            all[p.name] = versions[p.name] = c??p;
        }
    }
    return [all, versions, tags, raw.script_modules_mapping];
}
class PackageVersion{
    readonly path: string;
    readonly name: string;
    readonly fullName: string;
    readonly version: string;
    readonly fullVersion: string;
    readonly tag?: string;
    readonly sufix?: string;
    constructor(path: string){
        this.path = path;
        const [name,version] = path.split("_");
        this.fullName = name;
        this.name = this.fullName.slice(prefix.length);
        const parts = version.split(".");
        const sufix = parts.at(-1);
        this.sufix = sufix;
        const v = version.slice(0,version.length - (sufix?.length??0) - 1);
        this.fullVersion = v;
        const [ver, tag] = v.split("-");
        this.version = ver;
        this.tag = tag;
    }
}
function compareVersions(version1: string, version2: string) {
    const v1Components = version1.split('.').map(Number);
    const v2Components = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Components.length, v2Components.length); i++) {
        if (v1Components[i] === undefined) v1Components[i] = 0;
        if (v2Components[i] === undefined) v2Components[i] = 0;
        if (v1Components[i] < v2Components[i]) return -1; // version1 is smaller
        else if (v1Components[i] > v2Components[i]) return 1; // version1 is greater
        // If components are equal, continue to the next component
    }

    return 0; // Both versions are equal
}