import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Client, client } from "../../discord";

import selectorSubCommandExport from "./selectors";

const SUB_COMMANDS: {[key: string]: DefaultSubCommandExport} = {
    [selectorSubCommandExport.name]:selectorSubCommandExport
};
const BUILDER = new SlashCommandBuilder()
.setName("transform").setDescription("Transforms from one state to another");
Object.getOwnPropertyNames(SUB_COMMANDS).forEach(e=>BUILDER.addSubcommand(SUB_COMMANDS[e].builder));


client.registryCommand(BUILDER,
    async (client, commandName, interaction)=>{
        const subcommandName = interaction.options.getSubcommand();
        console.log("HELLO: " + subcommandName);
        await SUB_COMMANDS[subcommandName].handler(client, commandName, interaction);
    }
);

export interface DefaultSubCommandExport{
    name: string;
    builder: (e: SlashCommandSubcommandBuilder)=>SlashCommandSubcommandBuilder;
    handler: (client: Client, commandName: string, interaction: ChatInputCommandInteraction<CacheType>)=>Promise<void>;
}