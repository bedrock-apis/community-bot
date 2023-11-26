import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandModule } from "..";

export default {
    definition: new SlashCommandBuilder().setName("ping").setDescription("Checks the API latency"),
    execute: async (interaction)=>{
        const date = Date.now();
        await interaction.deferReply({fetchReply:true});
        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor("#336699").setTitle("PONG!").setDescription("```properties\nCurrent Bedrock API bot's latency: " + ((Date.now() - date) / 2).toFixed(0) + "ms\n```").setTimestamp(new Date())]
        });
    },
    isDevelopment:true
} as CommandModule;