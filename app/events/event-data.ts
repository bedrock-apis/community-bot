import { DiscordMessageResponse, DiscordSnowflakeType } from "discord-dependless";
import type { BedrockAPIsBot } from "../main";

export class EventData {}
export class BotEventData extends EventData {
    public constructor(
        public readonly bot: BedrockAPIsBot
    ){super()}
}
export class BotReadyEventData extends BotEventData {
    public constructor(bot: BedrockAPIsBot, 
        public readonly applicationId: DiscordSnowflakeType,
        public readonly guildsId: DiscordSnowflakeType[]){
            super(bot);
        }
}
export class MessageCreateEventData extends BotEventData {
    public constructor(bot: BedrockAPIsBot, 
        public readonly message: DiscordMessageResponse){
            super(bot);
        }
}