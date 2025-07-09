import { BedrockAPIsBot } from "./bot";
import {XMLParser} from "fast-xml-parser";
export * from "./bot";
export * from "discord-dependless";
export * from "./events";

export async function run(token: string): Promise<void>{
    const bot = new BedrockAPIsBot(token);

    bot.onReady.subscribe(_=>{
        globalThis.console.log(_);
    });
    bot.onMessageSend.subscribe(async _=>{
        let content = _.message.content;
        if(!content.length) return;

        globalThis.console.log(content);
        const value = content.match(/```xml\n([^]+)\n```/);
        if(value?.[1]){
            const n = new XMLParser({preserveOrder: true, parseAttributeValue: true, ignoreAttributes: false}).parse(value?.[1]) as any[];
            globalThis.console.log(JSON.stringify(n.map(valueOf).filter(_=>_), null, 3));
            const result = await bot.sendMessage(_.message.channel_id, {flags: 32768, components: [
                ...n.map(valueOf).filter(_=>_)
            ]});
            result.unwrap();
        }
    });
    await bot.login(34305);
    globalThis.console.log("Has logged in");
}
function valueOf(obj: any): any{
    if(obj[':@']){
        // attributes code
    }
    if(obj["#text"]) return String(obj["#text"]);
    if(obj["Text"]) return {type: 10, content: valueOf(obj["Text"][0])??"<null>"}
    if(obj["Container"]) return {type: 17, components: Array.from(obj["Container"]??[]).map(valueOf)}
    if(obj["MediaGallery"]) return {type: 12, items: Array.from(obj["MediaGallery"]??[]).map(valueOf)}
    if(obj["MediaItem"]) return {media: {url: valueOf(obj["MediaItem"][0])??"<null>"}}
    return null;
}