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
        const count = Math.min(Math.abs(interaction.options.getNumber("count",false)??1),16);
        let obj = ``;
        for (let i = 0; i < count; i++) obj += `\n${uuidv4()}`;

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`UUID v4`).setDescription("UUID v4 is a version of UUID that is generated based on random numbers. It produces unique identifiers from separate applications without the coordination of a centralized agent or process."+"\n```properties" + obj + "\n```").setFooter({text:count + "x"})]
        });
    },
} as CommandModuleDefinition;