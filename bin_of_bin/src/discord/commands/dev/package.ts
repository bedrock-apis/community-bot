import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { CommandModule } from "..";
import { PackageAnnouncementMessage } from "../../../discord/builders";
import { Package } from "../../../utils";

const packages = {
    "minecraft-server":"@minecraft/server",
    "minecraft-server-ui":"@minecraft/server-ui",
    "minecraft-server-editor":"@minecraft/server-editor",
    "minecraft-server-gametest":"@minecraft/server-gametest",
    "minecraft-server-net":"@minecraft/server-net",
    "minecraft-server-admin":"@minecraft/server-admin"
}

export default {
    definition: new SlashCommandBuilder().setName("package").setDescription("Checks the API latency").addStringOption(p=>p.setChoices(
        {value:"minecraft-server",name:"@minecraft/server"},
        {value:"minecraft-server-ui",name:"@minecraft/server-ui"},
        {value:"minecraft-server-editor",name:"@minecraft/server-editor"},
        {value:"minecraft-server-gametest",name:"@minecraft/server-gametest"},
        {value:"minecraft-server-net",name:"@minecraft/server-net"},
        {value:"minecraft-server-admin",name:"@minecraft/server-admin"},
    ).setName("package").setRequired(true).setDescription("Some Description")),
    execute: async (interaction)=>{
        const option = interaction.options.get("package")?.value;
        const packPromise = [Package.Load(packages[option as "minecraft-server"]),Package.Load("@minecraft/server-ui"),Package.Load("@minecraft/server-editor")];
        await interaction.deferReply({fetchReply:true});
        const pack = await Promise.all(packPromise);
        await interaction.editReply(PackageAnnouncementMessage(pack.map(p=>p.currentVersion)));
    },
    isDevelopment:true
} as CommandModule;