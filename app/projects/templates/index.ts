import {client, Client} from "../../discord";
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction,
    CacheType,
    BaseMessageOptions,
} from "discord.js";
import { AFTER_LOAD, CONTENT_LOADERS, PRE_LOAD } from "../project-loader/content-loader";
import { getPaths, GITHUB_NOT_FOUND_MESSAGE, SafeDownloadContent } from "../../features";
import { Context, resolveVariables } from "../project-loader/variables-manager";
import { GET_IMAGE } from "../project-loader";




let TEMPLATES: {
    [K: string]: Template
} = {};
export enum TemplateKind{
    attachment="attachment",
    content="content",
    image="image"
}


client.onStats.subscribe(()=>`available-templates: ${Object.keys(TEMPLATES).length}`);
async function onInteraction(client: Client, commandName: string, interaction: ChatInputCommandInteraction<CacheType>){
    const templateId = interaction.options.getString("template-id");
    if(templateId && templateId in TEMPLATES) {
        const template = TEMPLATES[templateId];
        const c = Context.FromInteraction(interaction);
        return interaction.reply((await template.messagePayload(c).catch(console.error))??{
            embeds: [new EmbedBuilder().setColor(0x5b2d31).setTitle(`Something went wrong`)]
        });
    }
    else await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x5b2d31).setTitle(`Can't resolve this template-id`)]
    });
}
PRE_LOAD.subscribe(()=>TEMPLATES = {});
AFTER_LOAD.subscribe(()=>{
    registryCommand();
    client.LoadCommands();
});
CONTENT_LOADERS["templates"] = async function SetContent(v,paths){
    const temp = v.templates;
    for (const key in temp) if(Object.prototype.hasOwnProperty.call(temp, key)){
        const value = temp[key];
        let p = typeof value === "object"?value.source:value;
        if(typeof p !== "string") continue;
        const template = new Template(p,getPaths(paths.join("/"),p).join("/"), key, value.type??TemplateKind.content, value.name, value.description);
        TEMPLATES[key] = template;
        console.log("[Template Loader] Loaded: " + key);
    }
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
    .setName("template").setDescription("Generate's template"),
    onInteraction
);
class Template{
    readonly path;
    readonly raw;
    readonly link;
    readonly name;
    readonly description;
    readonly id;
    readonly kind;
    constructor(raw: string, path: string, id: string, kind: string, name?: string, description?: string, link?: string){
        this.kind = kind;
        this.id = id;
        this.path = path;
        this.raw = raw;
        this.name = name;
        this.description = description;
        this.link = link;
    }
    async messagePayload(context: Context): Promise<BaseMessageOptions>{
        const embed = new EmbedBuilder().setColor(0x2b2d31);
        embed.setTitle(this.name?resolveVariables(this.name,context):this.id);
        const description = this.description?resolveVariables(this.description,context):"";
        embed.setDescription(description);
        switch (this.kind) {
            case TemplateKind.content:
                console.warn("Path: ",this.path);
                const data = await SafeDownloadContent(this.path??"");
                if(data.error || data.data?.toString?.() === GITHUB_NOT_FOUND_MESSAGE){
                    return { embeds:[new EmbedBuilder().setColor(0x4b2d31).setTitle(`Download of ${this.id} fails!`)]};
                }
                embed.setDescription(description + "\n```" + this.path.split(".").at(-1) + "\n" +resolveVariables(data.data?.toString()??"", context) +  "\n```");
                break;
            case TemplateKind.image:
                embed.setImage(GET_IMAGE(this.raw)??"");
                break;
            case TemplateKind.attachment:
                if(this.raw.startsWith("ref=")){
                    return {
                        embeds:[embed],
                        files:[
                            {
                                attachment: this.raw.substring(4)
                            }
                        ]
                    };
                }
                else{
                    console.log(this.path);
                    return {
                        embeds:[embed],
                        files:[
                            {
                                attachment: this.path,
                                name: this.path.split("/").at(-1)
                            }
                        ]
                    };
                }
            default:
                break;
        }
        return {embeds:[embed]};
    }
}