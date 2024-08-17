import {client} from "../../discord";
import { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, CacheType, AttachmentBuilder } from "discord.js";
import { COLORS, EMBED_BACKGROUND, SafeDownloadContent } from "../../features";
import { NBTFile } from "../../features";

const COMMAND_OPTIONS = {
    STRINGIFY_FILES: "from-file",
    BUILD_FILES: "to-file",
    FROM_BASE64: "from-base64",
    TO_BASE64: "to-base64"
};
client.registryCommand(
    new SlashCommandBuilder()
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName(COMMAND_OPTIONS.STRINGIFY_FILES)
        .setDescription("Stringify a nbt file to SNBT visual tree")
        .addAttachmentOption(e=>e.setName("file").setDescription("File you what you want to stringify").setRequired(true))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName(COMMAND_OPTIONS.BUILD_FILES)
        .setDescription("parse a snbt file to NBT data file")
        .addAttachmentOption(e=>e.setName("file").setDescription("File you what you want to stringify").setRequired(true))
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName(COMMAND_OPTIONS.FROM_BASE64)
        .setDescription("processe's BASE64 NBT to SNBT visual tree")
        .addStringOption(e=>e.setName("data").setDescription("Base64 you what you want to stringify").setRequired(true))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName(COMMAND_OPTIONS.TO_BASE64)
        .setDescription("parse a snbt to BASE64 NBT data file")
        .addStringOption(e=>e.setName("data").setDescription("Source you what you want to build").setRequired(true))
    )
    .setName("nbt").setDescription("Basic operations between NBT and SNBT"),
    async (client, commandName, interaction)=>{
        const subcommand = interaction.options.getSubcommand();
        try {
            if(subcommand in commandOptions) await commandOptions[subcommand as any](interaction);
            else await interaction.reply({
                embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
            });
        } catch (error: any) {
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle("Something went wrong").setDescription("```\n" + error.message +  "\n```")]
            });
        }
    }
);
const commandOptions: {[K: string]: (interaction: ChatInputCommandInteraction<CacheType>)=>Promise<any>} = {
    async [COMMAND_OPTIONS.STRINGIFY_FILES](interaction){
        const attachment = interaction.options.getAttachment("file");
        if(attachment){
            const data = await SafeDownloadContent(attachment.url);
            if(!data.data) return interaction.reply({
                embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Fails when downloading an attachment`)]
            });
            const file = NBTFile.Read(data.data);
            const snbt = file.toSNBT("  ");
            const lines = snbt.split("\n").slice(0,15);
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(COLORS.EMBED_DEFAULT).setTitle(`SNBT - Preview`).setDescription("```properties\n" + lines.join("\n") + (lines.length>15?"\n...\n":"") + "\n```")],
                files: [
                    new AttachmentBuilder(Buffer.from(snbt), {description: "Stringified " + attachment.name, name: "output.txt"})
                ]
            });
        }
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Attachment not found`)]
        });
    },
    async [COMMAND_OPTIONS.BUILD_FILES](interaction){
        const attachment = interaction.options.getAttachment("file");
        if(attachment){
            const data = await SafeDownloadContent(attachment.url);
            if(!data.data) return interaction.reply({
                embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Fails when downloading an attachment`)]
            });
            const file =  NBTFile.ReadAsSNBT(data.data.toString("utf-8"));
            const nbt = NBTFile.Write(file);
            return interaction.reply({
                files: [
                    new AttachmentBuilder(nbt, {description: "Stringified " + attachment.name, name: "data.txt"})
                ]
            });
        }
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Attachment not found`)]
        });
    },
    async [COMMAND_OPTIONS.FROM_BASE64](interaction){
        const textBase64 = interaction.options.getString("data");
        if(textBase64){
            const file = NBTFile.Read(Buffer.from(textBase64, "base64"));
            return interaction.reply({
                embeds:[
                    {
                        title: "SNBT",
                        description: "```properties\n" + file.toSNBT("   ") + "\n```",
                        color: COLORS.EMBED_DEFAULT
                    }
                ]
            });
        }
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Source data not found`)]
        });
    },
    async [COMMAND_OPTIONS.TO_BASE64](interaction){
        const textBase64 = interaction.options.getString("data");
        if(textBase64){
            const file = NBTFile.ReadAsSNBT(textBase64.replaceAll(/[”“]/g,'"'));
            return interaction.reply({
                embeds:[
                    {
                        title: "Base64 NBT",
                        description: "```properties\n" + NBTFile.Write(file).toString("base64") + "\n```",
                        color: COLORS.EMBED_DEFAULT
                    }
                ]
            });
        }
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(COLORS.EMBED_ERROR).setTitle(`Source data not found`)]
        });
    }
}