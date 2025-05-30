import { BedrockAPIsBot } from "./bot";

export * from "./bot";
export * from "discord-dependless";
export * from "./events";
const {log} =console;
export async function run(token: string): Promise<void>{
    const bot = new BedrockAPIsBot(token);

    bot.onReady.subscribe(_=>{
        log(_);
    });
    await bot.login(34305);
    log("Has run");
}