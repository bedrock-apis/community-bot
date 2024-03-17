import {client} from "../../discord";
import { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { Package, PackageVersion } from "../../features/npm";
import { NPM_MODULES } from "../constants/modules";

const choices = NPM_MODULES.map(e=>({value: e, name: "@minecraft/"+e}));
const packages: {[k: string]: string} = {};
NPM_MODULES.forEach(e=>packages[e] = "@minecraft/" + e);
client.registryCommand(
    new SlashCommandBuilder().addSubcommand(
        new SlashCommandSubcommandBuilder().setName("get").setDescription("Gets package information")
            .addStringOption(p=>p.setChoices(...choices).setName("package-id").setRequired(true).setDescription("Package name"))
            .addBooleanOption(n=>n.setName("latest-beta").setDescription("If true, it returns the latest beta version, if not, it returns the latest stable."))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName("info").setDescription("Gets the package information")
        .addStringOption(p=>p.setChoices(...choices).setName("package-id").setRequired(true).setDescription("Package name"))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName("current").setDescription("Gets the list of current versions for specified package")
        .addStringOption(p=>p.setChoices(...choices).setName("package-id").setRequired(true).setDescription("Package name"))
    ).addSubcommand(
        new SlashCommandSubcommandBuilder().setName("versions").setDescription("Gets the list of package versions")
        .addStringOption(p=>p.setChoices(...choices).setName("package-id").setRequired(true).setDescription("Package name"))
    )
    .setName("package").setDescription("Package APIs"),
    async (client, commandName, interaction)=>{
        const subcommand = interaction.options.getSubcommand();
        if(subcommand in commandOptions) await commandOptions[subcommand as any](interaction)
        else await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(`Unknow subcommand name: ` + interaction.options.getSubcommand())]
        });
    }
);
const commandOptions: {[K: string]: (interaction: ChatInputCommandInteraction<CacheType>)=>void} = {
    async "get"(interaction){
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
    },
    async "info"(interaction){
        const pack = await Package.Load(packages[interaction.options.getString("package-id") as any]);
        await interaction.reply({
            embeds: [getPackageInfoEmbed(pack)]
        });
    },
    async "current"(interaction){
        const pack = await Package.Load(packages[interaction.options.getString("package-id") as any]);
        await interaction.reply({
            embeds: [getPackageVersionListInfoEmbed(pack)]
        });
    },
    async "versions"(interaction){
        const pack = await Package.Load(packages[interaction.options.getString("package-id") as any]);
        await interaction.reply({
            embeds: [getAllPackageVersions(pack)]
        });
    }
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
function getPackageVersionListInfoEmbed(packageVersion: Package){
    const {name,LICENSE,description,developers:[d1,d2,d3], tags, versions} = packageVersion;
    const dev = d2??d3??d1;
    const arraysIntall = [undefined,undefined,undefined,undefined] as any[];
    for (const [tag, pVersion] of tags) {
        let text = null;
        let index = -1;
        switch(tag){
            case "rc": 
            case "preview":
            text = "Preview";
            index = 2;
            break;
            case "latest": 
            text = "Stable";
            index = 0;
            break;
            case "beta": 
            text = "Preview  •  Experimental";
            index = 3;
            default: break;
        }
        if(text) {
            const {version, zipFile} = pVersion;
            arraysIntall[index] = {
                name:text,
                value:`[Download](${zipFile})\n\`\`\`properties\nnpm i ${name}@${version}\n\`\`\``,
                inline: false
            };
        }
    }
    for (const [k, version] of versions){
        if(k.endsWith("-stable")){
            arraysIntall[1] = {
                name:"Stable  •  Experimental",
                value:`[Download.tgz](${version.zipFile})\n\`\`\`properties\nnpm i ${name}@${version.version}\n\`\`\``,
                inline: false
            };
            break;
        }
    }
    return new EmbedBuilder({
        title:"Module   •   `" + name + "`",
        url:`https://www.npmjs.com/package/${name}?activeTab=versions`,
        description:`**Description**\n${description}`,
        "color": 0x2b2d31,
        "fields": [
            ...arraysIntall.filter(n=>n)
        ]
    });
}
function getAllPackageVersions(packageVersion: Package){
    const {name,description,developers:[d1,d2,d3], versions} = packageVersion;
    const dev = d2??d3??d1;
    const versionsLike = [];
    let i = 15;
    for (const [k, {zipFile,unpackedSize:pS,releaseTime,fileCount}] of versions){
        if(!i--) break;
        versionsLike.push(`- [**${k}**](${zipFile})  \`Files ${fileCount}\` \`Size ${(pS%1000)?(pS/1000).toFixed(1):(pS/1000)}kb\` <t:${Math.floor(releaseTime/1000)}:R>`);
    }
    return new EmbedBuilder({
        title:"Module   •   `" + name + "`",
        url:`https://www.npmjs.com/package/${name}?activeTab=versions`,
        description:`**Description**\n${description}\n`+versionsLike.join("\n") + (versions.size>15?"\n- •••":""),
        "color": 0x2b2d31
    });
}