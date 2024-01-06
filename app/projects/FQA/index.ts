import { EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { client } from "../../discord";
import { EMBED_BACKGROUND, searchFor } from "../../features";
import { BuildEntryFQA, FQAEntry, GET_FQA_ENTIRES } from "./load-fqa";
import { Context, RESOURCES, resolveVariables } from "../project-loader";



client.on("messageCreate",(e)=>{
    if(e.content.startsWith("??")) {
        const text = e.content.replaceAll(/^\?+([ ]+|)/g,"");
        const ENTRIES = GET_FQA_ENTIRES();
        const keys = Object.keys(ENTRIES);
        const key = searchFor(text, keys);
        if(!key) return;
        const FQA = ENTRIES[key];
        e.reply({
            embeds:[
                buildEmbed(FQA, Context.FromMessage(e))
            ]
        });
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

function buildEmbed(fqa: FQAEntry, context: Context){
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