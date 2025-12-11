import { Bot, DiscordApplicationCommandUpdateRequest, DiscordMessageResponse, DiscordSnowflakeType,  Result } from "discord-dependless";
import { CustomEvent, BotReadyEventData, MessageCreateEventData } from "./events";

export class BedrockAPIsBot extends Bot {
    public applicationId?: DiscordSnowflakeType;
    public readonly onReady: CustomEvent<BotReadyEventData> = new CustomEvent();
    public readonly onMessageSend: CustomEvent<MessageCreateEventData> = new CustomEvent();
    public readonly onMessageEdit: CustomEvent<MessageCreateEventData> = new CustomEvent();
    public constructor(token: string) {
        super({ token });
    }
    public async login(intentBits: number): Promise<void> {
        // IntentBits required for specific permission and events to get fired
        const gateway = await this.connect(intentBits);
        gateway.addEventListener("VOICE_STATE_UPDATE", _=>globalThis.console.log(_, _.data));
        gateway.addEventListener("READY", _ => {
            this.applicationId = _.data.application.id;
            this.onReady.trigger(new BotReadyEventData(this, this.applicationId, _.data.guilds.map(e=>e.id)));
        });
        gateway.addEventListener("MESSAGE_CREATE", _ => this.onMessageSend.trigger(new MessageCreateEventData(this, _.data)));
        gateway.addEventListener("MESSAGE_UPDATE", _ => this.onMessageEdit.trigger(new MessageCreateEventData(this, _.data as DiscordMessageResponse)));
        gateway.addEventListener("error", globalThis.console.error);
    }
    public async setCommands(commands: DiscordApplicationCommandUpdateRequest[]): Promise<void> {
        if (!this.applicationId)
            throw new ReferenceError("Bot is not ready yet");

        await Result.unwrap(this.setApplicationCommands(this.applicationId, commands));
    }
}