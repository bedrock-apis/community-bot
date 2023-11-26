import { EmbedBuilder } from "discord.js";
import { PackageVersion } from "../../utils";
import { MinecraftIconPreview, MinecraftIconStable } from "../../resources";

export const PackageAnnouncementEmbed = (packageVersion: PackageVersion)=>{
    const {name,LICENSE,description,developers:[dev]} = packageVersion.package;
    const {version,fileCount,zipFile} = packageVersion;
    return new EmbedBuilder({
        title:"Version  •  " + version,
        url:`https://www.npmjs.com/package/${name}/v/${version}`,
        description:`**Description**\n${description}`,
        "color": 0x2b2d31,
        "fields": [
            {
                name:"License",
                value:LICENSE,
                inline:true
            },
            {
                name:"Package Download",
                value:`[${version}.tgz](${zipFile})`,
                inline:true
            },
            {
                name:"Files Included",
                value:"" + fileCount,
                inline:true
            },
            {
                name:"Install",
                value:`\`\`\`properties\nnpm i ${name}@${version}\n\`\`\``,
                inline:false
            }
        ],
        //"timestamp": new Date(packageVersion.releaseTime).toISOString(),/*
        /*"footer": {
            "text": devName,
            icon_url: `https://www.npmjs.com/${avatarSmall}`
        }*/
    }).setAuthor({name:"Module  " + name,url:`https://www.npmjs.com/package/${name}/v/${version}`})
};
export const BDSAnnouncementEmbed = (version: string,isPreview: boolean)=>{
    const [major,minor,hotfix,dev] = version.split(".");
    return new EmbedBuilder({
        title:"Bedrock Dedicated Server  •  " + (isPreview?"Preview " +  version :"Stable " + [major,minor,hotfix].join(".")),
        thumbnail:{"url":isPreview?MinecraftIconPreview:MinecraftIconStable},
        url:`https://www.minecraft.net/en-us/download/server/bedrock`,
        description:"**Description**\n"+"If you want to run a multiplayer server for Minecraft, start by downloading the Bedrock Dedicated Server for either Windows or Ubuntu (Linux).",
        "color": 0x2b2d31,
        "fields": [
            {
                name:"Download Windows",
                value:`[bedorck-server-${version}.zip](https://minecraft.azureedge.net/bin-win${isPreview?"-preview":""}/bedrock-server-${version}.zip)`,
                inline:false
            },
            {
                name:"Download Linux",
                value:`[bedorck-server-${version}.zip](https://minecraft.azureedge.net/bin-win${isPreview?"-preview":""}/bedrock-server-${version}.zip)`,
                inline:false
            }
        ],
        timestamp: new Date().toISOString(),
    });
};