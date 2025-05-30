import { BedrockAPIsBot } from "./bot";

export * from "./bot";
export * from "discord-dependless";
export * from "./events";

export async function run(token: string): Promise<void>{
    const bot = new BedrockAPIsBot(token);

    bot.onReady.subscribe(_=>{
        console.log(_);
    });
    await bot.login(34305);
    console.log("Runned");
}