import { ApplicationCommandType, CacheType, ChatInputCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder, InteractionContextType, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { client } from "../../discord";
import { BOT_RESOURCES_REPO_ROOT_RAW, COLORS, EMBED_BACKGROUND, searchFor } from "../../features";
import { Context} from "../project-loader";
import { FAQ_MANAGER, FAQEntry, FAQManager } from "./manager";
import * as JSON from "comment-json";

client.registryCommand(
    new SlashCommandBuilder()
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName("get").setDescription("Gets specific FAQ information")
            .addStringOption(p=>p.setName("faq-id").setRequired(true).setDescription("faq key").setAutocomplete(true))
    )
    /*
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName("build").setDescription("builds the visualizable fqa from escaped text")
        .addStringOption(e=>e.setName("content").setDescription("escaped description data").setRequired(true))
        .addStringOption(e=>e.setName("title").setDescription("title data"))
        .addStringOption(e=>e.setName("image-link").setDescription("image-data"))
    )*/
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName("info").setDescription("Gets specific FAQ information")
        .addStringOption(p=>p.setName("faq-id").setRequired(true).setDescription("faq key").setAutocomplete(true))
    )
    .setName("faq").setDescription("FAQ"),
    async (client, commandName, interaction)=>{
        const subcommand = interaction.options.getSubcommand();
        if(subcommand in commandOptions) await commandOptions[subcommand as any](interaction as any)
        else await interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
        });
    }
);
const commandOptions: {[K: string]: (interaction: ChatInputCommandInteraction<CacheType>)=>void} = {
    async "get"(interaction){
        const option = interaction.options.getString("faq-id")??"undefined";
        try {
            await interaction.reply({
                embeds: [
                    FAQ_MANAGER.getEmbedFor(option as string, Context.FromInteraction(interaction))
                ]
            });
        } catch (error) {
            const entry = searchFor(
                    option,
                    [...FAQ_MANAGER.searchKeys.keys()]
                )[0];
            await interaction.reply({
                embeds: [
                    new EmbedBuilder().setTitle("Unknow FAQ")
                    .setColor(EMBED_BACKGROUND | 0xf00000)
                    .setDescription("Unknow FAQ key `" + option +  "`, isn't `" + entry.result + "` what you meant?")
                ]
            });
        }
    },
    async "info"(interaction){
        const option = interaction.options.getString("faq-id")??"undefined";
        try {
            const entry = FAQ_MANAGER.getFAQ(option as string);
            const embed = 
            new EmbedBuilder()
            .setTitle("FAQ Information")
            .setDescription("This faq file path is called `" + entry.metaURI +  "`")
            .addFields({name: "Name", value: "`" + entry.name + "`", inline: true})
            .addFields({name: "Title", value: "`" + entry.title + "`", inline: true})
            .addFields({name: "Has Image", value: entry.image?"`True`":"`False`", inline: true})
            .addFields({name: "Link", value: entry.link?"[Redirect]("+entry.link+")":"`undefined`", inline: true})
            .addFields({name: "Source File", value: "[Github Source]("+"https://github.com/bedrock-apis/bot-resources/tree/" + BOT_RESOURCES_REPO_ROOT_RAW.split("/").at(-1) + "/" + entry.metaURI+")", inline: true})
            .addFields({name: "Body length", value: "`" + entry.body.length + "`", inline: true})
            if(entry.aliases.length) embed.addFields({
                name: "Aliases",
                value: "```properties\n" + entry.aliases.join("\n") + "\n```",
                inline: false
            })

            await interaction.reply({ embeds: [ embed ] });
        } catch (error) {
            const entry = searchFor(
                    option,
                    [...FAQ_MANAGER.searchKeys.keys()]
                )[0];
            await interaction.reply({
                embeds: [
                    new EmbedBuilder().setTitle("Unknow FAQ")
                    .setColor(EMBED_BACKGROUND | 0xf00000)
                    .setDescription("Unknow FAQ key `" + option +  "`, isn't `" + entry.result + "` what you meant?")
                ]
            });
        }
    }
}
client.on("interactionCreate", async e=>{
    if(e.isAutocomplete()){
        const hint = e.options.getFocused();
        if(hint?.length < 2) await e.respond([...FAQ_MANAGER.entries.values()].slice(0,24).map(e=>({value:e.name,name:e.title})));
        else {
            const filtered = new Set();
            /*console.log(
                searchFor(
                    hint.toLocaleLowerCase(), 
                    [...FAQ_MANAGER.searchKeys.keys()]
                ));*/
            await e.respond(
                searchFor(
                    hint.toLocaleLowerCase(), 
                    [...FAQ_MANAGER.searchKeys.keys()]
                ).map(e=>FAQ_MANAGER.getFAQ(e.result))
                .filter(e=>filtered.has(e)?false:filtered.add(e))
                .slice(0,15)
                .map(e=>{
                        return {value:e.name, name:e.title};
                    }
                )
            )
        }
    }
});

async function build(interaction: any, definition: string, content: string){
    try {
        const warnings = [];
        const {
            title = "Empty Title",
            image = undefined,
            name = undefined,
            color = COLORS.EMBED_DEFAULT
        } = JSON.parse(definition) as any;
        const entry = new FAQEntry();
        entry.name = "<your-name-here>";
        entry.title = title;
        entry.body = content;
        entry.image = image;
        entry.color = color;
        const embed = FAQManager.BuildEmbed(entry, Context.FromInteraction(interaction));
        let code = entry.toYaml();
        let text = "- Yaml\n```yaml\n";
        if(code.includes("```")) text = ":warning:  **Warning** - Code blocks in description are encoded but they are works like regular \\`\\`\\` \n" + text;
        text += (code = code.replaceAll("```","%60%60%60"));
        text += "\n```\n- Preview"
        const embeds = [embed];
        if(warnings.length) {
            // embeds push warnings
        }
        await interaction.reply({
            //content:text,
            embeds
        });
    } catch (error: any) {
        console.log(error, error.stack);
        return await interaction.reply({
            embeds:[
                new EmbedBuilder().setTitle("Faild to build a FQA").setColor(EMBED_BACKGROUND | 0x100000).setDescription("```\n"+ error +"\n```")
            ]
        });
    }
}
const errorEmbedMessage = `
Expected at least two lines, first line is for json definitions of FAQ, and has to end with \`;\`.
\`\`\`properties
{...};
My faq content
\`\`\`
Here is example of definitions
\`\`\`json
{"title":"title", "image":"ref=https://...", "color":"#ffffff"}
\`\`\`
each definition entry is optional so empty JSON object definition is allowed
`;
client.registryCommand(new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message).setName("faq-preview"), async (client, cmd, interaction)=>{
    const message = (interaction as any).targetMessage as Message;
    const lines = message.content.split(/\;\n/g);
    if(lines.length <= 1) {
        await interaction.reply({
            embeds:[
                new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle("Faild to build FAQ")
                .setDescription(errorEmbedMessage)
            ]
        })
        return;
    }
    const [firstLine] = lines;
    const contentData = message.content.substring(firstLine.length + 2);
    await build(interaction, firstLine, contentData).catch(async (error)=>{
        await interaction.reply({
            embeds:[
                new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle("Faild to build FAQ")
                .setDescription(errorEmbedMessage),
                new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle("Error Message")
                .setDescription('````\n' + error + '\n```')
            ]
        })
    });
});