import { SlashCommandBuilder, SlashCommandNumberOption } from "discord.js";
import { CommandModuleDefinition } from "../CommandDefinition";
import { EmbedBuilder } from "@discordjs/builders";
import { uuidv4 } from "../../../features";

export default {
    definition: new SlashCommandBuilder().setName("uuid").setDescription("Generate uuids version 4")
        .addNumberOption(
            new SlashCommandNumberOption()
            .setName("count")
            .setDescription("number of generated uuids")
            .setRequired(false)
        ),
    async execute(interaction: any) {
        const count = interaction.options.getNumber("count",false)??1;
        let obj = ``;
        for (let i = 0; i < Math.min(Math.abs(count),16); i++) obj += `\n${uuidv4()}`;
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle("UUID v1  -  " + Math.min(Math.abs(count),16) + "x").setDescription("```properties" + obj + "\n```")]
        });
    },
} as CommandModuleDefinition;