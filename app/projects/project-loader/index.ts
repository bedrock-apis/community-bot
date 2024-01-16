import {client} from "../../discord";
import "./main_variables";
import { CONTENT_LOADERS, loadJob } from "./content-loader";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { GET_VARIABLES } from "./main_variables";
import { Context, resolveVariables } from "./variables-manager";
import { GET_IMAGES } from "./resources-manager";
client.onReload.subscribe(async ()=>{
    await loadJob();
});
client.onStats.subscribe(()=>`available-loaders: ${Object.keys(CONTENT_LOADERS).length}`);
client.onStats.subscribe(()=>`available-images: ${Object.keys(GET_IMAGES()).length}`);
client.onStats.subscribe(()=>`available-variables: ${Object.keys(GET_VARIABLES()).length}`);
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
            for (const key in RESOURCES.VARIABLES) variables.push(key);
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`List of variables`).setDescription("```properties\n" + variables.join("\n") + "\n```")]
            });
        }
        else if(subcommand === "resolve") {
            const data = interaction.options.getString("data");
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Resolved Output`).setDescription("```\n" + resolveVariables(data??"", Context.FromInteraction(interaction)) + "\n```")]
            });
        }
        else await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x4b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
        });
    }
)
export const RESOURCES = {
    get VARIABLES(){return GET_VARIABLES();},
    get IMAGES(){return GET_IMAGES();}
}
export * from "./content-loader";
export * from "./main_variables";
export * from "./variables-manager";
export * from "./resources-manager";