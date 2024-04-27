import { BOT_RESOURCES_REPO_ROOT_RAW, GetGithubContent, getPaths } from "../../features";
import { CONTENT_LOADERS, PRE_LOAD } from "../project-loader";
import { FAQ_MANAGER, FAQEntry } from "./manager";
import { parse} from "yaml";
import { client } from "../../discord";

import "./commands";
import "./interaction";

PRE_LOAD.subscribe(()=>FAQ_MANAGER.clear());
client.onStats.subscribe(()=>{ return `faq-entries: ${FAQ_MANAGER.entries.size}`; });

CONTENT_LOADERS["faq"] = async function SetContent(v,paths){
    const basePath = paths.join("/");
    const pathLength = BOT_RESOURCES_REPO_ROOT_RAW.split("/").length;
    let tasks = [];
    if(Array.isArray(v.files)) for (const faq_file of v.files) {
        if(typeof faq_file !== "string") continue;
        const link = getPaths(basePath, faq_file);
        const task = GetGithubContent(link.join("/")).then(e=>{
            if(!e) return;
            const entry = new FAQEntry();
            const raw_text = e.toString().replaceAll("%60%60%60","```");
            const object = faq_file.endsWith(".json")?JSON.parse(raw_text):parse(raw_text);
            entry.setName(object.name.toLowerCase());
            entry.setBody(object.body);
            entry.setMetaURI([...link.slice(pathLength)].join("/"));
            if(object.title) entry.setTitle(object.title);
            if(object.image) entry.setImage(object.image);
            if(object.link) entry.setImage(object.link);
            if(Array.isArray(object.aliases)) for(const alias of object.aliases) entry.addAliases(alias);
            FAQ_MANAGER.addFAQ(entry);
        }).catch(e=>null/*console.error(e)*/);
        tasks.push(task);
    }
    await Promise.all(tasks);
}
/*
export function BuildEntryFQA(raw: any, file: string){
    const tags = raw.tags?.filter((e: string)=>typeof e === "string")??[];
    const entry = new FAQEntry(file, tags, raw.title, raw.body, raw.image, raw.link);
    return entry;
}*/
/*
const currentMessages = new Map<string, {message:Message<boolean>, time: NodeJS.Timeout, userId: string}>();
client.on("messageReactionAdd", async (e, s)=>{
    if(s.id === e.client.user.id) return;
    const data = currentMessages.get(e.message.id);
    if(data){
        const {message, time, userId} = data;
        if(message.id === e.message.id && s.id === userId && e.emoji.identifier === CANCEL_EMOJI_IDENTIFIER){
            currentMessages.delete(message.id);
            clearTimeout(time);
            await message.delete();
        }
    }
});
client.on("messageCreate",async (e)=>{
    const data = GetInfo()[e.guildId??"null"];
    if(!(GUILD_IDS.includes(e.guildId??"") && DEBUG) && (!data || !(data.faqChannels[e.channelId]??data.allowFAQ))) return;
    if(e.member?.user.id === e.client.user.id) return;
    const content = e.content;
    if(content.match(/^([ ]+|)\?\?+/g)) {
        const text = content.replaceAll(/^([ ]+|)\?\?+([ ]+|)/g,"").toLowerCase().replaceAll(/[ \-_\*\/\\\,\;]+/g,"-");
        const ENTRIES = GET_FQA_ENTIRES();
        const keys = Object.keys(ENTRIES);
        const key = searchFor(text, keys)[0].result;
        if(!key) return;
        const FQA = ENTRIES[key];
        const m = await e.reply({
            embeds:[
                buildEmbed(FQA, Context.FromMessage(e))
            ],
            allowedMentions:{parse:[]}
        });
        const timeId = setTimeout(()=>{
            if(currentMessages.has(m.id)) currentMessages.delete(m.id);
            m.reactions.removeAll().catch(()=>{});
        }, CANCEL_REACTION_TIMEOUT);
        currentMessages.set(m.id, {message:m, time: timeId, userId:e.member?.user.id??""});
        m.react(CANCEL_EMOJI_IDENTIFIER);
    } else if(content.match(/^([ ]+|)\!\!+/g) && e.member){
        return;/*
        const text = content.replaceAll(/^([ ]+|)\!\!+([ ]+|)/g,"").toLowerCase().replaceAll(/[ \-\_\*\/\\\,\;]+/g,"-");
        const a = searchFor(text, ["edit", "create", "edit-tags", "remove"]);
        e.reply({
            flags:[4096],
            content:a +": "+ e.member.roles.cache.map(e=>`<@&${e.id}>`).join(" | ") + " has: Testing role " + e.member.roles.cache.has("1222205753369169920")
        });*//*
    }
});
PRE_LOAD.subscribe(()=>currentMessages.clear());

function buildEmbed(fqa: FAQEntry, context: Context){
    const embed = new EmbedBuilder().setColor(Math.floor(0xffffff*Math.random()) /*"#217FE5" /*EMBED_BACKGROUND).setTitle("FQA - Title").setTimestamp(new Date());
    if(fqa.title) embed.setTitle(resolveVariables(fqa.title,context));
    if(fqa.body) embed.setDescription(resolveVariables(fqa.body,context));
    if(fqa.link) embed.setURL(fqa.link);
    if(fqa.image) { 
        let link = fqa.image.startsWith("ref=")?fqa.image.substring(4):RESOURCES.IMAGES[fqa.image];
        if(link) embed.setImage(link)
    }
    return embed;
}
*/
