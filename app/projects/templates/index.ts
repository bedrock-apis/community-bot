import {client, Client} from "../../discord";
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction,
    CacheType,
} from "discord.js";
import { CONTENT_LOADERS } from "../project-loader/content-loader";
import { getPaths, GITHUB_NOT_FOUND_MESSAGE, SafeDownloadContent } from "../../features";
import { Context, resolveVariables } from "../project-loader/variables-manager";

let TEMPLATES: {
    [K: string]: Template
} = {};
async function onInteraction(client: Client, commandName: string, interaction: ChatInputCommandInteraction<CacheType>){
    const templateId = interaction.options.getString("template-id");
    if(templateId && templateId in TEMPLATES) {
        const template = TEMPLATES[templateId];
        const data = await SafeDownloadContent(template.file??"");
        if(data.error || data.data?.toString?.() === GITHUB_NOT_FOUND_MESSAGE){
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x4b2d31).setTitle(`Download of ${templateId} fails!`)]
            });
        }
        else{
            const c = new Context(interaction);
            const text = resolveVariables(data.data?.toString() as string, c);
            const name = template.name?resolveVariables(template.name,c):templateId;
            const description = template.description?resolveVariables(template.description,c):"";
            await interaction.reply({
                embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle(name).setDescription(description + "\n```" + template.file.split(".").at(-1) + "\n" + text +  "\n```")]
            });
        }
    }
    else await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x5b2d31).setTitle(`Can't resolve this template-id`)]
    });
}

CONTENT_LOADERS["templates"] = async function SetContent(v,paths){
    TEMPLATES = {};
    const temp = v.templates;
    for (const key in temp) if(Object.prototype.hasOwnProperty.call(temp, key)){
        const value = temp[key];
        let p = typeof value === "object"?value.file:value;
        if(typeof p !== "string") continue;
        const template = new Template(getPaths(paths.join("/"),p).join("/"), key, value.name, value.description);
        TEMPLATES[key] = template;
        console.log("[Template Loader] Loaded: " + key);
    }
    registryCommand();
    client.LoadCommands();
}
const registryCommand = ()=>
    client.registryCommand(
    new SlashCommandBuilder()
    .addStringOption(p=>{
        p.setChoices(...Object.keys(TEMPLATES).map(e=>({
            name: e,
            value: e,
        })));
        p.setName("template-id").setRequired(true).setDescription("Id of template what you want to generate")
        return p;
    })
    .setName("template").setDescription("Generat's template"),
    onInteraction
);
class Template{
    readonly file;
    readonly name;
    readonly description;
    readonly id;
    constructor(file: string, id: string , name?: string, description?: string){
        this.id = id;
        this.file = file
        this.name = name;
        this.description = description;
    }
}