import {client} from "../../discord";
import { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Package, PackageVersion } from "../../features/npm";

client.registryCommand(
    new SlashCommandBuilder().addSubcommand(
        new SlashCommandSubcommandBuilder().setName("get").setDescription("Get Package information")
            .addStringOption(p=>p.setChoices(
                {value:"minecraft-server",name:"@minecraft/server"},
                {value:"minecraft-common",name:"@minecraft/common"},
                {value:"minecraft-server-ui",name:"@minecraft/server-ui"},
                {value:"minecraft-server-editor",name:"@minecraft/server-editor"},
                {value:"minecraft-server-gametest",name:"@minecraft/server-gametest"},
                {value:"minecraft-server-net",name:"@minecraft/server-net"},
                {value:"minecraft-server-admin",name:"@minecraft/server-admin"},
            ).setName("package-id").setRequired(true).setDescription("Package name"))
            .addBooleanOption(n=>n.setName("latest-beta").setDescription("If true, it returns the latest beta version, if not, it returns the latest stable."))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName("info").setDescription("Gets the Package information")
        .addStringOption(p=>p.setChoices(
            {value:"minecraft-server",name:"@minecraft/server"},
            {value:"minecraft-common",name:"@minecraft/common"},
            {value:"minecraft-server-ui",name:"@minecraft/server-ui"},
            {value:"minecraft-server-editor",name:"@minecraft/server-editor"},
            {value:"minecraft-server-gametest",name:"@minecraft/server-gametest"},
            {value:"minecraft-server-net",name:"@minecraft/server-net"},
            {value:"minecraft-server-admin",name:"@minecraft/server-admin"},
        ).setName("package-id").setRequired(true).setDescription("Package name"))
    )
    .setName("package").setDescription("Package APIs"),
    async (client, commandName, interaction)=>{
        switch (interaction.options.getSubcommand()) {
            case "get":
                const useBeta = interaction.options.getBoolean("latest-beta");
                const info1 = await Package.Load(packages[interaction.options.getString("package-id") as any]);
                if(useBeta){
                    if(!info1.tags.has("beta")) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2b2d31).setTitle("Beta tag not found").setDescription("'beta' tag for `" + packages[interaction.options.getString("package-id") as any] + "` wasn't found. Showing latest version."),
                                getPackageVersionInfoEmbed(info1.latestVersion as any)
                            ]
                        });
                    }else{
                        interaction.reply({
                            embeds: [
                                getPackageVersionInfoEmbed(info1.tags.get("beta") as any)
                            ]
                        });
                    }
                }else{
                    await interaction.reply({
                        embeds: [getPackageVersionInfoEmbed(info1.latestVersion as any)]
                    });
                }
                break;
            case "info":
                const info2 = await Package.Load(packages[interaction.options.getString("package-id") as any]);
                await interaction.reply({
                    embeds: [getPackageInfoEmbed(info2)]
                });
                break;
            default:
                await interaction.reply({
                    embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
                });
                break;
        }
    }
);
const packages: {[k: string]: string} = {
    "minecraft-common":"@minecraft/common",
    "minecraft-server":"@minecraft/server",
    "minecraft-server-ui":"@minecraft/server-ui",
    "minecraft-server-editor":"@minecraft/server-editor",
    "minecraft-server-gametest":"@minecraft/server-gametest",
    "minecraft-server-net":"@minecraft/server-net",
    "minecraft-server-admin":"@minecraft/server-admin"
}

function getPackageInfoEmbed(pack: Package){
    const {currentVersion,latestVersion,tags,description,LICENSE,developers,name,types,url} = pack;
    const navi = developers.find(e=>e.name === "darknavi");
    return new EmbedBuilder({
        title:"NPM  •  " + name,
        url:`https://www.npmjs.com/package/${name}`,
        description:`**Description**\n${description}`,
        "color": 0x2b2d31,
        "fields": [
            {
                name:"License",
                value:LICENSE,
                inline:true
            },
            {
                name:"Latest Version",
                value:`[${latestVersion.version}](https://www.npmjs.com/package/${name}/v/${latestVersion.version})`,
                inline:true
            },
            {
                name:"Current Version",
                value:`[${currentVersion.version}](https://www.npmjs.com/package/${name}/v/${currentVersion.version})`,
                inline:true
            },
            {
                name:"Tags",
                value:`\`\`\`properties\n${[...tags.keys()].join("\n")}\n\`\`\``,
                inline:false
            }
        ],
        "timestamp": new Date(pack.currentVersion.releaseTime).toISOString(),
        "footer": {
            "text": navi?.name + "",
            icon_url: `https://www.npmjs.com/${navi?.avatarSmall}`
        }
    });
}
function getPackageVersionInfoEmbed(packageVersion: PackageVersion){
    const {name,LICENSE,description,developers:[dev]} = packageVersion.package;
    const {version,fileCount,zipFile} = packageVersion;
    return new EmbedBuilder({
        title:"Version  •  " + version,
        url:`https://www.npmjs.com/package/${name}/v/${version}?activeTab=versions`,
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
    }).setAuthor({name:"Module  " + name,url:`https://www.npmjs.com/package/${name}/v/${version}`});
}