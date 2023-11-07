import {Client as CL, GatewayIntentBits, Interaction} from "discord.js";
import path from "path";
import {promises as fs} from "fs";
import { CommandModuleDefinition } from "./commands/CommandDefinition";

export class Client extends CL<true>{
    commands = new Map<string,CommandModuleDefinition>();
    constructor(){
        super({
            intents: GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildModeration | GatewayIntentBits.Guilds | GatewayIntentBits.MessageContent
        });
        this.on("ready",this.onReady as any);
        this.on("interactionCreate",this.onInteraction);
    }
    onReady(){
        console.log("[Client] Logged in as ", this.user.displayName);
        this.onInitialize().catch(er=>console.error(er,er.stack));
    }
    async onInitialize(){
        const commandsPath = path.resolve(__dirname,"./commands");
        for (const folder of await fs.readdir(commandsPath,{withFileTypes:true})) {
            if(folder.isDirectory()) for (const file of await fs.readdir(commandsPath +"/"+ folder.name,{withFileTypes:true})) {
                if((!file.isFile()) || (!file.name.endsWith(".js"))) continue;
                try {
                    console.log("[Client][Commands][Registry]",`Loading command from: ${[folder.name,file.name].join("/")}`);
                    const module = (await import(["./commands/",folder.name,file.name].join("/"))) as any;
                    if(!("default" in module)) {
                        console.warn("[Client][Commands][Registry]","Faild to load structure of",[folder.name,file.name].join("/"));
                        continue;
                    }
                    const def = module.default as CommandModuleDefinition;
                    if(typeof def.execute !== "function" || typeof (def?.definition as any)?.name !== "string"){
                        console.warn("[Client][Commands][Registry]","Faild to load structure of",[folder.name,file.name].join("/"));
                        continue;
                    }
                    const {definition:{name}} = def as any;
                    if(this.commands.has(name)) console.warn("[Client][Commands][Registry] Duplicated command name redefinition: " + name);
                    this.commands.set(name,def);
                } catch (error) {
                    console.warn("[Client][Commands][Registry]","Faild to load module ",[folder.name,file.name].join("/"), (error as any)?.message);
                }
            }
        }
        this.application.commands.set(Array.from(this.commands,([k,v])=>v.definition));
        console.log("[Client][Commands][Registry]", this.commands.size,"commands were successfully registered");
    }
    async onInteraction(interaction: Interaction){
        try {
            if(interaction.isCommand()) this.commands.get(interaction.commandName)?.execute(interaction,this);
        } catch (error: any) {
            console.log(error.message);
        }
    }
    async login(token?: string){
        do {
            try {
                await super.login(token);
            } catch (error: any) {
                if(error?.code === "UND_ERR_CONNECT_TIMEOUT") {
                    console.warn("[Client][Login]",`Faild to login, next try in 1min`);
                    await new Promise(res=>setTimeout(res,1*60*1000));
                    continue;
                }
            }
            return token??"";
        } while (true);
    }
}