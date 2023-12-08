import { DownloadContent, SafeDownloadContent, uuidv4 } from "../features";
import { content_types, manifestExamplesKey, resources, variablesKey } from "../resources";
import * as fs from "node:fs";
import path from "node:path";

export async function ReloadManifestExamples(){
    const contents = await SafeDownloadContent("https://raw.githubusercontent.com/Bedrock-APIs/bot-resources/main/manifest-teplates/folder_contents.json");
    const examples = {};
    let loaded = 0;
    try {
        const data = JSON.parse("" + contents.data);
        if(!(data.type in content_types)) throw null;
        const contentT = content_types[data.type as "manifest-templates"] as any;
        const raw_files = data[contentT[contentT.type]];
        const pL = path.resolve(".").length;
        const c = await Promise.all(raw_files.map((e: string)=>{
            SafeDownloadContent("https://raw.githubusercontent.com/Bedrock-APIs/bot-resources/main" + path.resolve("./manifest-teplates",raw_files).substring(pL).replaceAll("\\","/"));
        }));
    } catch (error) {
        loaded = -1;
    }
    resources.set(manifestExamplesKey,examples);
    return `loaded-manifest-examples: ` + loaded;
}