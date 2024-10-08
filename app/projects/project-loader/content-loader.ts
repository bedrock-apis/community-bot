import { BOT_RESOURCES_REPO_ROOT_RAW, GITHUB_NOT_FOUND_MESSAGE, PublicEvent, SafeDownloadContent, TriggerEvent, getPaths } from "../../features";
import { LoadAll } from "./main_variables";
import {parse} from "comment-json";

export async function loadJob(){
    const taskBariableLoad = LoadAll();
    const preTask = TriggerEvent(PRE_LOAD);
    const baseContents = await SafeDownloadContent(BOT_RESOURCES_REPO_ROOT_RAW + "/contents.json");
    if(baseContents.error || baseContents.data?.toString?.() === GITHUB_NOT_FOUND_MESSAGE) throw baseContents.error??GITHUB_NOT_FOUND_MESSAGE;
    const contents = parse(baseContents.data?.toString("utf-8")??"") as string[];
    let tasks = [] as any[];
    let paths = [];
    for (let locationPath of contents) {
        const path = getPaths(BOT_RESOURCES_REPO_ROOT_RAW, locationPath);    
        tasks.push(SafeDownloadContent(path.join("/")));
        paths.push(path);
    }
    let resolvedTasks = await Promise.all(tasks);
    await Promise.all(preTask);
    tasks = [];
    let i = 0;
    for (const {error,data} of resolvedTasks) {
        if(error || data?.toString?.() === GITHUB_NOT_FOUND_MESSAGE) continue;
        try {
            const text = data?.toString()??"";
            const sources = parse(text) as any;
            const newTask = ContentLoader(sources, paths.shift()??[], text).catch(e=>console.log("Failed to run loader for: " + sources.type));
            tasks.push(newTask.then(()=>i++).catch(e=>console.error(e.message)));
        } catch (error) { continue; }
    }
    await Promise.all(tasks);
    await taskBariableLoad;
    await Promise.all(TriggerEvent(AFTER_LOAD));
    return i;
}
async function ContentLoader(content: {[K: string]: any}, path: string[], raw: string){
    if(content.type in CONTENT_LOADERS) {
        const array = [...path];
        const loader = CONTENT_LOADERS[content.type];
        if("jsonParse" in loader) await CONTENT_LOADERS[content.type]((loader as any).jsonParse(raw), array, array.pop()??"");
        else await CONTENT_LOADERS[content.type](content, array, array.pop()??"");
    }else{
        console.warn("[Project-Loader] No content loader for: " + content.type);
    }
}
export const CONTENT_LOADERS: {[K: string]: (v: {[K: string]: any}, p: string[], index: string)=>Promise<void>;} = {}
export const PRE_LOAD = new PublicEvent();
export const AFTER_LOAD = new PublicEvent();
