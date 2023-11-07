import { SlashCommandBuilder } from "discord.js";
import { CommandModuleDefinition } from "../CommandDefinition";
import { EmbedBuilder } from "@discordjs/builders";

export default {
    definition: new SlashCommandBuilder().setName("ping").setDescription("Check my latency!"),
    async execute(interaction, client) {
        const date = Date.now();
        await interaction.deferReply({fetchReply:true});
        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle("Current Latency  -  " + client.user.displayName).setDescription("```properties\n" + ((Date.now() - date) / 2).toFixed(0) + " ms\n```").setTimestamp(new Date())]
        });
    },
} as CommandModuleDefinition;