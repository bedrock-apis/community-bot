import { ApplicationCommandDataResolvable, CommandInteraction } from "discord.js"
import { Client } from "../client"

export interface CommandModuleDefinition{
    definition: ApplicationCommandDataResolvable
    execute(this: this, interaction: CommandInteraction, client: Client): void | Promise<void>
    privileges?: boolean
}
