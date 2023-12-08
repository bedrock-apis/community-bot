import {client} from "../../discord";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

client.registryCommand(
    new SlashCommandBuilder().setName("reload").setDescription("Reloads all resources").setDefaultMemberPermissions(0),
    async (client, commandName, interaction)=>{
        console.warn("Reloading resources");
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Reloading . . .`)]
        });
    }
);