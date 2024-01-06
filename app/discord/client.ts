import { BaseApplicationCommandData, ButtonInteraction, Client as CL, CacheType, ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, GatewayIntentBits, Interaction, SlashCommandBuilder} from "discord.js";
import { PublicEvent, TriggerEvent } from "../features";

export class Client extends CL<true>{
    readonly _commandDefinitions = new Map<string,BaseApplicationCommandData>();
    readonly _commandHandlers = new WeakMap<BaseApplicationCommandData,(n: this,commandname: string, interaction: CommandInteraction<CacheType>)=>void>();
    readonly onReload = new PublicEvent<[]>;
    readonly onButtonPress = new PublicEvent<[string,ButtonInteraction]>;
    //readonly onCommandInteractionEvent = new PublicEvent<[]>
    constructor(){
        super({
            intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.Guilds | GatewayIntentBits.MessageContent
        });
        this.on("ready",this.onReady as any);
        this.on("interactionCreate",this.onInteraction);
    }
    protected async onReady(){
        console.log("[Client] Logged in as", this.user.displayName);
        await Promise.all(TriggerEvent(this.onReload));
        this.LoadCommands();
    }
    async LoadCommands(){
        //@ts-ignore
        this.application.commands.set([...this._commandDefinitions.values()]);
        console.log("[Client][Commands][Registry]", this._commandDefinitions.size,"commands were successfully registered");
    }
    protected async onInteraction(interaction: Interaction){
        try {
            if(interaction.isCommand()) {
                console.log("Command -> " + interaction.commandName);
                const a = this._commandDefinitions.get(interaction.commandName);
                if(this._commandHandlers.has(a as any)) await this._commandHandlers.get(a as any)?.(this,interaction.commandName, interaction);
            }else if(interaction.isButton()){
                await TriggerEvent(this.onButtonPress,interaction.customId,interaction);
            }
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
                console.warn("Unexpected login error: " + error);
            }
            return token??"";
        } while (true);
    }
    //@ts-ignore
    registryCommand(commandDefinition: ContextMenuCommandBuilder, handler: (n: this,commandname: string, interaction: ContextMenuCommandInteraction<CacheType>)=>void): this
    registryCommand(commandDefinition: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">, handler: (n: this,commandname: string, interaction: ChatInputCommandInteraction<CacheType>)=>void): this
    registryCommand(commandDefinition: BaseApplicationCommandData, handler: (n: this,commandname: string, interaction: CommandInteraction<CacheType>)=>void)
    {
        const commandName = commandDefinition.name;
        this._commandDefinitions.set(commandName,commandDefinition);
        this._commandHandlers.set(commandDefinition,handler as any);
        return this;
    }
}
export const client = new Client();