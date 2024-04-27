import { Message } from "discord.js";
import { client } from "../../discord";
import { CANCEL_EMOJI_IDENTIFIER, CANCEL_REACTION_TIMEOUT, DEBUG, GUILD_IDS, searchFor } from "../../features";
import { Context } from "../project-loader";
import { GetInfo } from "../general";
import { FAQ_MANAGER } from "./manager";



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

        const entry = searchFor(
            text,
            [...FAQ_MANAGER.searchKeys.keys()]
        )[0];

        if(!entry) return;
        const m = await e.reply({
            embeds:[
                FAQ_MANAGER.getEmbedFor(entry.result, Context.FromMessage(e))
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
        });*/
    }
});