import { client } from "../../discord";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Diff } from "diff";

client.registryCommand(
    new SlashCommandBuilder().setName("diff").setDescription("Generates a differencies between two sources")
        .addStringOption(p=>p.setName("old").setRequired(true).setDescription("old string source"))
        .addStringOption(p=>p.setName("new").setRequired(true).setDescription("new string source")),
    async (client, commandName, interaction)=>{
        const oldStirng = interaction.options.getString("old");
        const newString = interaction.options.getString("new");
        const changes = new Diff().diff(oldStirng + "",newString + "");
        const additions = changes.filter(e=>e.added);
        const deletions = changes.filter(e=>e.removed);
        const embeds = [];
        if(additions.length) embeds.push(new EmbedBuilder().setColor(0x2b4d31).setTitle("Diff - Additions").setDescription("```\n" + additions.map(e=>e.value).join("\n") + "\n```"))
        if(deletions.length) embeds.push(new EmbedBuilder().setColor(0x4b2d31).setTitle("Diff - Deletions").setDescription("```\n" + deletions.map(e=>e.value).join("\n") + "\n```"))
        if(additions.length == 0 && deletions.length == 0) embeds.push(new EmbedBuilder().setColor(0x2b2d31).setTitle("Diff - No changes"))
        interaction.reply({
            embeds
        });
    }
);