import { CacheType, ChatInputCommandInteraction, Message } from "discord.js";
import { CONTENT_LOADERS } from "./content-loader"; 
import { GET_VARIABLES } from "./main_variables";
export class DynamicVariables{
    constructor(){
        Context.prototype.propertiesNames.forEach(p=>{
            this.defineVariable$("context."+p,(c: any)=>c[p], false);
        });
    }
    defineVariable$(key: string, value: any, isGetter?: boolean): void
    defineVariable$(key: string, value: (context: Context)=>any, isGetter = true){
        Object.defineProperty(this,key,{
            configurable:true,
            [isGetter?"get":"value"]: value,
            enumerable: true
        });
    }
    getVariable$(key: string, context: Context){
        const v = this[key];
        if(typeof v === "function") return v(context);
        return v;
    }
}
export interface DynamicVariables{ [K: string]: any }
export class Context{
    readonly milliseconds;
    readonly seconds;
    readonly year;
    readonly time;
    readonly date;
    readonly name;
    readonly ["display-name"];
    readonly ["user-name"];
    readonly ["user-display-name"];
    readonly ["user-id"];
    readonly ["guild-id"];
    /*
    readonly ["command-name"];
    readonly ["command-id"];*/
    constructor(interaction: {
        user:{ id:string, username: string, displayName: string}, 
        client:{user:{username:string,displayName:string}},
        guildId: string
    }){
        const {
            user:{id:userId, username: userName, displayName: userDisplayName}, 
            client:{user:{username:name,displayName:displaynName}},
            guildId
        } = interaction;
        const time = new Date();
        this.milliseconds = time.getTime();
        this.seconds = Math.floor(time.getTime() / 1000);
        this.time = time.toTimeString().substring(0,"00:00:00 GMT+0100".length);
        this.date = time.toDateString();
        this.year = time.getFullYear();
        this.name = name;
        this["display-name"] = displaynName;
        this["user-name"] = userName;
        this["user-display-name"] = userDisplayName;
        this["user-id"] = userId;
        this["guild-id"] = guildId;
        /*
        this["command-name"] = commandName;
        this["command-id"] = commandId;*/
    }
    get propertiesNames(){ return props; }
    static FromInteraction(interaction: ChatInputCommandInteraction<CacheType>){
        return new Context({
            user:interaction.user,
            client:interaction.client,
            guildId: interaction.guildId??""
        })
    }
    static FromMessage(interaction: Message){
        return new Context({
            user:interaction.author,
            client:interaction.client,
            guildId: interaction.guildId??""
        })
    }
}
const props = [
    "milliseconds",
    "seconds",
    "year",
    "time",
    "date",
    "name",
    "display-name",
    "user-name",
    "user-display-name",
    "user-id",
    "guild-id",
    /*
    "command-name",
    "command-id"*/
];

CONTENT_LOADERS["static-veriables"] = async function Loader(content: any) {
    saveVariables(GET_VARIABLES(), null, content.variables)
}
function saveVariables(resources: any, path: string | null, variables: any){
    if(path) path += ".";
    else path = "";
    for (const v of Object.getOwnPropertyNames(variables)) {
        const e = variables[v];
        if(typeof e === "object"){
            saveVariables(resources, path + v, e);
        }else{
            resources[path + v] = e;
        }
    }
}
export function resolveVariables(text: string, context: Context){
    return text.replaceAll(/(\{\{[a-z0-9\.\-]+\}\})|(\"\[\[[a-z0-9\.\-]+\]\]\")/g,(e)=>{
        if(e.startsWith("{")){
            const key = e.substring(2, e.length - 2);
            return GET_VARIABLES().getVariable$(key, context);
        }else if (e.startsWith('"')) {
            const key = e.substring(3, e.length - 3);
            return GET_VARIABLES().getVariable$(key, context);
        }
        else return e;
    })
}