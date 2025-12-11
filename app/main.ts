import { BedrockAPIsBot } from "./bot";
import { setup } from "./faq";
import { DiscordGatewayIntentBits } from "./gateway-intents";
export * from "./bot";
export * from "discord-dependless";
export * from "./events";

export async function run(token: string): Promise<BedrockAPIsBot> {
    const bot = new BedrockAPIsBot(token);
    await setup(bot);
    await bot.login(DiscordGatewayIntentBits.Guilds | DiscordGatewayIntentBits.GuildVoiceStates | DiscordGatewayIntentBits.GuildMessages | DiscordGatewayIntentBits.MessageContent);
    return bot;
}