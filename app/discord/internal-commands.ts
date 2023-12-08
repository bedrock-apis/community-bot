import { EmbedBuilder, SlashCommandBuilder, SlashCommandNumberOption } from "discord.js";
import {client} from "./client";
import { uuidv4 } from "../features";

client.registryCommand(
    new SlashCommandBuilder().setName("ping").setDescription("Check my latency!"),
    async (client, commandName, interaction)=>{
        const date = Date.now();
        await interaction.deferReply({fetchReply:true});
        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle("Current Latency  -  " + client.user.displayName).setDescription("```properties\n" + ((Date.now() - date) / 2).toFixed(0) + " ms\n```").setTimestamp(new Date())]
        });
    }
);
client.registryCommand(
    new SlashCommandBuilder().setName("uuid").setDescription("Generate uuids version 4").addNumberOption(
        new SlashCommandNumberOption()
        .setName("count")
        .setDescription("number of generated uuids")
        .setRequired(false)
    ),
    async (client, commandName, interaction)=>{
        //@ts-ignore
        const count = Math.min(Math.abs(interaction.options.getNumber("count",false)??1),16);
        let obj = ``;
        for (let i = 0; i < count; i++) obj += `\n${uuidv4()}`;
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`UUID v4`).setDescription("UUID v4 is a version of UUID that is generated based on random numbers. It produces unique identifiers from separate applications without the coordination of a centralized agent or process."+"\n```properties" + obj + "\n```")]
        });
    }
); 