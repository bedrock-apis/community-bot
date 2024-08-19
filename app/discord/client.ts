import { ActivityType, BaseApplicationCommandData, ButtonInteraction, Client as CL, CacheType, ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, Embed, EmbedBuilder, GatewayIntentBits, Interaction, MessageCreateOptions, MessagePayload, SlashCommandBuilder} from "discord.js";
import { EMBED_BACKGROUND, MAIN_CHANNEL_ID, MAIN_GUILD, PublicEvent, TriggerEvent } from "../features";
import activities from "./activities";
export class Client extends CL<true>{
    isReloading?: Promise<void>;
    get readyState(){ return this.isReloading == null && this.isReady();}
    readonly _commandDefinitions = new Map<string,BaseApplicationCommandData>();
    readonly _guildCommandDefinitions = new Map<string,{scopes: string[], definition:BaseApplicationCommandData}>();
    readonly _commandHandlers = new WeakMap<BaseApplicationCommandData,(n: this,commandname: string, interaction: CommandInteraction<CacheType>)=>void>();
    readonly onReload = new PublicEvent<[]>;
    readonly onButtonPress = new PublicEvent<[string,ButtonInteraction]>;
    readonly onStats = new PublicEvent<[]>;
    //readonly onCommandInteractionEvent = new PublicEvent<[]>
    constructor(){
        super({
            intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.Guilds | GatewayIntentBits.MessageContent | GatewayIntentBits.GuildMessageReactions
        });
        this.on("ready",this.onReady as any);
        this.on("interactionCreate",this.onInteraction);
        this.onStats.subscribe(()=>`available-commands: ${this._commandDefinitions.size}`);
        this.onStats.subscribe(()=>`available-guild-commands: ${this._guildCommandDefinitions.size}`);
        this.onStats.subscribe(()=>`guild-count: ${this.guilds.cache.size}`);
    }
    protected async onReady(){
        console.log("[Client] Logged in as ", this.user.displayName);
        await this.reload();
        await this.LoadCommands();
        setInterval(()=>this.pickPresence(), 600*1000);
        const stats = await Promise.all(TriggerEvent(this.onStats));
        this.sendInfo({
            embeds: [
                new EmbedBuilder()
                .setColor(EMBED_BACKGROUND).setTitle("Bot - Ready")
                .setDescription("```properties\n" + stats.join("\n") + "\n```")
                .setTimestamp(new Date())
            ]
        })
        setInterval(()=>this.reload(), 30 * 60 * 1000);
    }
    async pickPresence(){
        //@ts-ignore
        this.user.setPresence(activities[Math.floor(Math.random() * activities.length)]);
    }
    async LoadCommands(){
        //@ts-ignore
        this.application.commands.set([...this._commandDefinitions.values()]);
        console.log("[Client][Commands][Registry]", this._commandDefinitions.size,"commands were successfully registered");
        this.guilds.cache.forEach(e=>{
            const commands = Array.from(this._guildCommandDefinitions.values()).filter(d=>d.scopes.includes(e.id)).map(e=>e.definition);
            
            //@ts-ignore
            if(commands.length) e.commands.set(commands);
        })
    }
    protected async onInteraction(interaction: Interaction){
        try {
            if(!this.readyState){
                if(interaction.isRepliable()){
                    interaction.reply({ephemeral:true, content: "Bot is in loading state, please wait until bot is loaded."})
                }
                return;
            }
            if(interaction.isCommand()) {
                const a = this._commandDefinitions.get(interaction.commandName)??this._guildCommandDefinitions.get(interaction.commandName)?.definition;
                if(this._commandHandlers.has(a as any)) await this._commandHandlers.get(a as any)?.(this,interaction.commandName, interaction);
                else console.warn("Unknown interaction: " + interaction.commandName);
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
    registryCommand(commandDefinition: ContextMenuCommandBuilder, handler: (n: this,commandname: string, interaction: ContextMenuCommandInteraction<CacheType>)=>void, scope?: string[] | null): this
    registryCommand(commandDefinition: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">, handler: (n: this,commandname: string, interaction: ChatInputCommandInteraction<CacheType>)=>void, scope?: string[] | null): this
    registryCommand(commandDefinition: BaseApplicationCommandData, handler: (n: this,commandname: string, interaction: CommandInteraction<CacheType>)=>void, scope: string[] | null = null)
    {
        const commandName = commandDefinition.name;
        if(scope) {
            this._guildCommandDefinitions.set(commandName, {scopes: scope, definition: commandDefinition});
        }
        else this._commandDefinitions.set(commandName,commandDefinition);
        this._commandHandlers.set(commandDefinition,handler as any);
        return this;
    }
    sendInfo(msg: MessagePayload | string | MessageCreateOptions){
        const channel = this.guilds.cache.get(MAIN_GUILD)?.channels?.cache?.get(MAIN_CHANNEL_ID);
        if(channel && channel.isTextBased()) channel.send(msg);
    }
    async reload(){
        try {
            if(this.isReloading) return await this.isReloading;
            return await (this.isReloading = new Promise(res=>{
                const p = Promise.all(TriggerEvent(this.onReload)) as any;
                setTimeout(res,100, p);
            }));
        } finally {
            if(this.isReloading) this.isReloading = undefined;
        }
    }
}
export const client = new Client();