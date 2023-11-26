import { ApplicationCommandData, ApplicationCommandDataResolvable, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BedrockAPIsClient } from "../client";
import { settings } from "src/load";

export interface CommandModule{
    definition: ApplicationCommandDataResolvable
    execute(this: this, interaction: CommandInteraction, client:BedrockAPIsClient, data: typeof settings["data"]): void | Promise<void>
    isDevelopment?: boolean
}
export type CommandModuleDefinition = {default:CommandModule};