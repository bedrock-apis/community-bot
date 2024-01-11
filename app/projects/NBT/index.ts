import {client} from "../../discord";
import { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, CacheType, AttachmentBuilder } from "discord.js";
import { SafeDownloadContent } from "../../features";
import { NBTFile } from "../../features";

client.registryCommand(
    new SlashCommandBuilder().addSubcommand(
        new SlashCommandSubcommandBuilder().setName("stringify")
        .setDescription("Stringify a nbt file to SNBT visual tree")
        .addAttachmentOption(e=>e.setName("file").setDescription("File you what you want to stringify").setRequired(true))
    )
    .setName("snbt").setDescription("Basic SNBT operation"),
    async (client, commandName, interaction)=>{
        const subcommand = interaction.options.getSubcommand();
        if(subcommand in commandOptions) await commandOptions[subcommand as any](interaction);
        else await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
        });
    }
);
const commandOptions: {[K: string]: (interaction: ChatInputCommandInteraction<CacheType>)=>void} = {
    async "stringify"(interaction){
        const attachment = interaction.options.getAttachment("file");
        if(attachment){
            const data = await SafeDownloadContent(attachment.url);
            if(!data.data) return interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x4b2d31).setTitle(`Fails when downloading an attachment`)]
            });
            const file = NBTFile.Read(data.data);
            const snbt = file.toSNBT("  ");
            const lines = snbt.split("\n").slice(0,15);
            return interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`SNBT`).setDescription("```properties\n" + lines.join("\n") + (lines.length>15?"\n...\n":"") + "\n```")],
                files: [
                    new AttachmentBuilder(Buffer.from(snbt), {description: "Stringified " + attachment.name, name: "output.txt"})
                ]
            });
        }
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x4b2d31).setTitle(`Attachment not found`)]
        });
    }
}