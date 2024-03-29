import { CONTENT_LOADERS, PRE_LOAD } from "../project-loader/content-loader";
import { GetGithubContent, getPaths } from "../../features";

let FQA_ENTRIES: {[K:string]: FAQEntry} = {};
let tags: FAQEntry[] = [];
export const GET_FQA_ENTIRES = ()=>FQA_ENTRIES;
export const GET_RAW_ENTRIES = ()=>tags;
PRE_LOAD.subscribe(()=>(FQA_ENTRIES = {}, tags = []));
CONTENT_LOADERS["faq"] = async function SetContent(v,paths){
    const basePath = paths.join("/");
    let tasks = [];
    if(Array.isArray(v.files)) for (const fqaFile of v.files) {
        if(typeof fqaFile !== "string") continue;
        const link = getPaths(basePath, fqaFile).join("/");
        const task = GetGithubContent(link).then(e=>{
            if(!e) return;
            const raw = JSON.parse(e.toString());
            const entry = BuildEntryFQA(raw, link);
            tags.push(entry);
            for (const t of entry.tags) FQA_ENTRIES[t] = entry;
        }).catch(e=>console.error(e));
        tasks.push(task);
    }
    await Promise.all(tasks);
}
export class FAQEntry{
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
    const entry = new FAQEntry(file, tags, raw.title, raw.body, raw.image, raw.link);
    return entry;
}