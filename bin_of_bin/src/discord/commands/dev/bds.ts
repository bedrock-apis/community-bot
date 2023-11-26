import { APIActionRowComponent, APIMessageActionRowComponent, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { CommandModule } from "..";
import { BDSAnnouncementMessage } from "../../../discord/builders";

export default {
    definition: new SlashCommandBuilder().setName("bds").setDescription("Testing BDS"),
    execute: async (interaction)=>{
        await interaction.reply(BDSAnnouncementMessage("1.20.30.21",true));
    },
    isDevelopment:true
} as CommandModule;