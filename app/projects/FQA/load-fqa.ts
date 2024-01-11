import { CONTENT_LOADERS, PRE_CLEAN } from "../project-loader/content-loader";
import { GetGithubContent, getPaths } from "../../features";

let FQA_ENTRIES: {[K:string]: FQAEntry} = {};
export const GET_FQA_ENTIRES = ()=>FQA_ENTRIES;
PRE_CLEAN.subscribe(()=>FQA_ENTRIES = {});
CONTENT_LOADERS["fqa"] = async function SetContent(v,paths){
    const basePath = paths.join("/");
    let tasks = [];
    if(Array.isArray(v.files)) for (const fqaFile of v.files) {
        if(typeof fqaFile !== "string") continue;
        const link = getPaths(basePath, fqaFile).join("/");
        const task = GetGithubContent(link).then(e=>{
            if(!e) return;
            const raw = JSON.parse(e.toString());
            const entry = BuildEntryFQA(raw, link);
            for (const t of entry.tags) FQA_ENTRIES[t] = entry;
        }).catch(e=>console.error(e));
        tasks.push(task);
    }
    await Promise.all(tasks);
}
export class FQAEntry{
    readonly file;
    readonly title;
    readonly body;
    readonly tags;
    readonly image;
    readonly link;
    constructor(file: string, tags: string[] , title?: string, body?: string, image?: string, link?: string){
        this.tags = tags;
        this.file = file;
        this.title = title;
        this.body = body;
        this.image = image;
        this.link = link;
    }
}

export function BuildEntryFQA(raw: any, file: string){
    const tags = raw.tags?.filter((e: string)=>typeof e === "string")??[];
    const entry = new FQAEntry(file, tags, raw.title, raw.body, raw.image, raw.link);
    return entry;
}