import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import {promises as fs} from "fs";
import path from "path";
import type { CommandModule, CommandModuleDefinition } from "../commands";
import "../../load";

const locals = {
    commandsFolder: "../commands"
};


export class BedrockAPIsClient extends Client<true>{
    readonly commands: Map<string,CommandModuleDefinition["default"]>
    constructor(){
        super({
            intents: GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildModeration | GatewayIntentBits.Guilds | GatewayIntentBits.MessageContent
        });
        this.on("ready",this.onReady as (client: Client<true>)=>Promise<void>);
        this.on("interactionCreate",async (interaction)=>{
            if(interaction.isCommand() && this.commands.has(interaction.commandName)){
                const def = this.commands.get(interaction.commandName) as CommandModule;
                try {
                    console.log("[Client][InteractionHandler]",`Command ${interaction.commandName} executed by ${interaction.user.username}`);
                    await def.execute.call(def,interaction,this,data);
                } catch (error) {
                    if(!interaction.replied){
                        await interaction.reply({
                            ephemeral:true,
                            content:`## Failed to execute </${interaction.commandName}:${interaction.commandId}> command\n\`\`\`\n${error}\n\`\`\``
                        });
                    }
                    if(interaction.deferred){
                        await interaction.editReply({
                            content:`## Failed to execute </${interaction.commandName}:${interaction.commandId}> command\n\`\`\`\n${error}\n\`\`\``
                        });
                    }
                    console.error("[Client][InteractionHandler] Command fails to execute: " + interaction.commandName, error);
                }
            }
        });
        process.on("exit",async ()=>{
            if(this.isReady()) await this.destroy();
        });
        this.commands = new Map();
    }
    async onCommandsLoad(client: this){
        const commandsPath = path.resolve(__dirname,locals.commandsFolder);
        for (const folder of await fs.readdir(commandsPath,{withFileTypes:true})) {
            if(folder.isDirectory()) for (const file of await fs.readdir(commandsPath +"/"+ folder.name,{withFileTypes:true})) {
                if((!file.isFile()) || (!file.name.endsWith(".js"))) continue;
                try {
                    console.log("[Client][Commands][Registry]",`Loading command from: ${[folder.name,file.name].join("/")}`);
                    const module = await import([locals.commandsFolder,folder.name,file.name].join("/")) as CommandModuleDefinition;
                    if(!("default" in module)) {
                        console.warn("[Client][Commands][Registry]","Faild to load structure of",[folder.name,file.name].join("/"));
                        continue;
                    }
                    const def = module.default;
                    if(typeof def.execute !== "function" || typeof (def?.definition as any)?.name !== "string"){
                        console.warn("[Client][Commands][Registry]","Faild to load structure of",[folder.name,file.name].join("/"));
                        continue;
                    }
                    const {definition:{name}} = def as any;
                    if(client.commands.has(name)) console.warn("[Client][Commands][Registry] Duplicated command name redefinition: " + name);
                    client.commands.set(name,def);
                } catch (error) {
                    console.warn("[Client][Commands][Registry]","Faild to load module ",[folder.name,file.name].join("/"), error);
                }
            }
        }
        client.application.commands.set(Array.from(client.commands,([k,v])=>v.definition));
        console.log("[Client][Commands][Registry]", client.commands.size,"commands were successfully registered");
    }
    async onReady(client: this){
        console.warn("[Client][Login]",`Successfully loged in as "${client.user.username}"`);
        await client.onCommandsLoad(client);
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
export const client = new BedrockAPIsClient();