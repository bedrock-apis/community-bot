import { client } from "../../discord";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

client.registryCommand(
    new SlashCommandBuilder().setName("encrypt").setDescription("description"),
    async (client, commandName, interaction)=>{
        await interaction.reply({
            content:"EMPTY",
            ephemeral: true
        });
    }
);