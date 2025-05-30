import { BedrockAPIsBot } from "./bot";

export * from "./bot";
export * from "discord-dependless";
export * from "./events";

export async function run(token: string): Promise<void>{
    const bot = new BedrockAPIsBot(token);

    await bot.login();
}