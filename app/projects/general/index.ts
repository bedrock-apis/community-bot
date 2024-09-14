import { client } from "../../discord";
import { CONTENT_LOADERS } from "../project-loader";
import * as JSON from "comment-json";

let data: {[k: string]: GuildInfo} = {};
async function Loader(obj: any, path: string[], index: string){
    data = {};
    for(const k of Object.keys(obj)) if(k!=="type") data[k] = new GuildInfo(obj[k]);
}
CONTENT_LOADERS["bot-info"] = Loader;
client.onStats.subscribe(()=>{
    return `known-guilds: ${Object.keys(data).length}`;
})

export class GuildInfo{
    public allowFAQ?: boolean;
    public faqChannels: {[k: string]: boolean};
    public faqManagers: {[k: string]: boolean};
    constructor(data: any){
        this.allowFAQ = data["allow-faq"]??false;
        this.faqChannels = data["faq-channels"]??{};
        this.faqManagers = {};
        if(Array.isArray(data["faq-management"])) for(const k of data["faq-management"]) 
            if(typeof k === "string") this.faqManagers[k] = true;
            else console.warn("[GENERAL-INFO]","Invalid faqManager value: " + k);
        else console.warn("[GENERAL-INFO]","faq-management is not an array");
    }
}
export function GetInfo(){return data;}
export function ParseStr(v: string){return v.split("#")[0];}
Loader.jsonParse = function parseJson(v: string){return JSON.parse(v, (k, value)=>{
    if(typeof value === "string") return ParseStr(value);
    else return value;
});}