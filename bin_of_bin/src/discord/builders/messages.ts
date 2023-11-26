import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { settings } from "../../load";
import { PackageVersion } from "../../utils";
import { BDSAnnouncementEmbed, PackageAnnouncementEmbed } from "./embed";
import { BedrockDedicatedServerFile } from "../../resources";

export const PackageAnnouncementMessage = (packs: PackageVersion[])=>({
    content:`<@&${settings.data.roles.npm_announcements}>`,
    embeds:packs.map(pack=>PackageAnnouncementEmbed(pack))
});
export const BDSAnnouncementMessage = (version: string,isPreview: boolean)=>({
    content:`<@&${settings.data.roles.bds_announcements}>`,
    embeds:[BDSAnnouncementEmbed(version,isPreview)],
    components:[
        new ActionRowBuilder().addComponents(new ButtonBuilder({
            label:"Download for Windows",
            style:ButtonStyle.Link,
            url:BedrockDedicatedServerFile(version,"win",isPreview)
        }).setEmoji("📦"),
        new ButtonBuilder({
            label:"Download for Linux",
            style:ButtonStyle.Link,
            url:BedrockDedicatedServerFile(version,"linux",isPreview)
        }).setEmoji("📦")) as any
    ]
});