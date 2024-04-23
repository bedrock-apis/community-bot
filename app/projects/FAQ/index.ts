import { EmbedBuilder,  Message,  SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { client } from "../../discord";
import { CANCEL_EMOJI_IDENTIFIER, CANCEL_REACTION_TIMEOUT, DEBUG, EMBED_BACKGROUND, GUILD_IDS, searchFor } from "../../features";
import { BuildEntryFQA, FAQEntry, GET_FQA_ENTIRES, GET_RAW_ENTRIES } from "./load-faq";
import { Context, PRE_LOAD, RESOURCES, resolveVariables } from "../project-loader";
import { GetInfo } from "../general";

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
        const key = searchFor(text, keys);
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
        });*/
    }
});
client.registryCommand(
    new SlashCommandBuilder()
    .addSubcommand(new SlashCommandSubcommandBuilder().setName("build").setDescription("builds json into the visualizable fqa").addStringOption(e=>e.setName("json").setDescription("data").setRequired(true)))
    .setName("fqa").setDescription("fqa tool"),
    async (client, cName, interaction)=>{
        const subCommand = interaction.options.getSubcommand();
        if(subCommand === "build"){
            const data = interaction.options.getString("json");
            try {
                const parsed = JSON.parse(data??"");
                const entry = BuildEntryFQA(parsed, "empty.null");
                const embed = buildEmbed(entry, Context.FromInteraction(interaction));
                await interaction.reply({
                    embeds:[
                        embed
                    ]
                });
            } catch (error) {
                return await interaction.reply({
                    embeds:[
                        new EmbedBuilder().setTitle("Faild to build a FQA").setColor(EMBED_BACKGROUND | 0x100000)
                    ]
                });
            }
        }
    }
)
PRE_LOAD.subscribe(()=>currentMessages.clear());
function buildEmbed(fqa: FAQEntry, context: Context){
    const embed = new EmbedBuilder().setColor(EMBED_BACKGROUND).setTitle("FQA - Title");
    if(fqa.title) embed.setTitle(resolveVariables(fqa.title,context));
    if(fqa.body) embed.setDescription(resolveVariables(fqa.body,context));
    if(fqa.link) embed.setURL(fqa.link);
    if(fqa.image) { 
        let link = fqa.image.startsWith("ref=")?fqa.image.substring(4):RESOURCES.IMAGES[fqa.image];
        if(link) embed.setImage(link)
    }
    return embed;
}
client.onStats.subscribe(()=>{ return `faq-entries: ${GET_RAW_ENTRIES().length}`; })