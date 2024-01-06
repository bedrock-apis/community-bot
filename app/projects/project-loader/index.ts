import {client} from "../../discord";
import "./main_variables";
import { loadJob } from "./content-loader";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { VARIABLES } from "./main_variables";
import { Context, resolveVariables } from "./variables-manager";
client.onReload.subscribe(async ()=>{
    await loadJob();
})
client.registryCommand(
    new SlashCommandBuilder()
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName("list").setDescription("Returns all resigtred variable names")
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder().setName("resolve").setDescription("returns inserted text with resolved variables")
        .addStringOption(e=>e.setName("data").setDescription("Data you want to resolve").setRequired(true))
    )
    .setName("variables").setDescription("manage and view variables"),
    async (client, commandName, interaction)=>{
        const subcommand = interaction.options.getSubcommand();
        if(subcommand === "list") {
            const variables = [];
            for (const key in VARIABLES) variables.push(key);
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`List of variables`).setDescription("```properties\n" + variables.join("\n") + "\n```")]
            });
        }
        else if(subcommand === "resolve") {
            const data = interaction.options.getString("data");
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Resolved Output`).setDescription("```\n" + resolveVariables(data??"", new Context(interaction)) + "\n```")]
            });
        }
        else await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x4b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
        });
    }
)
export * from "./content-loader";
export * from "./main_variables";
export * from "./variables-manager";