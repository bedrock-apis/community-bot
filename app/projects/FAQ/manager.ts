import { EmbedBuilder } from "discord.js";
import { Context, resolveVariables, RESOURCES } from "../project-loader";
import { stringify } from "yaml";
import { EMBED_BACKGROUND } from "../../features";

export class FAQManager{
    public readonly entries = new Map<string, FAQEntry>();
    public readonly searchKeys = new Map<string, FAQEntry>();
    constructor(){}
    addFAQ(faq: FAQEntry){
        this.entries.set(faq.name, faq);
        this.searchKeys.set(faq.name, faq);
        for(const alias of faq.aliases) this.searchKeys.set(alias, faq);
        return this;
    }
    getFAQ(key: string){
        const faq = this.searchKeys.get(key);
        if(faq) return faq;
        else throw new ReferenceError("Unknow faq key: " + key);
    }
    getEmbedFor(key: string, context: Context){  return FAQManager.BuildEmbed(this.getFAQ(key), context); }
    clear(){
        this.entries.clear();
        this.searchKeys.clear();
    }
    static BuildEmbed(faq: FAQEntry, context: Context){
        const embed = new EmbedBuilder().setColor(EMBED_BACKGROUND).setTitle("FQA - Title").setTimestamp(new Date());
        if(faq.title) embed.setTitle(resolveVariables(faq.title,context));
        if(faq.body) embed.setDescription(resolveVariables(faq.body,context));
        if(faq.link) embed.setURL(faq.link);
        if(faq.image) { 
            let link = faq.image.startsWith("ref=")?faq.image.substring(4):RESOURCES.IMAGES[faq.image];
            if(link) embed.setImage(link)
        }
        return embed;
    }
}
export class FAQEntry{
    name: string;
    private _title?: string;
    image?: string;
    link?: string;
    body: string;
    aliases: string[] = [];
    metaURI?: string;
    get title(){return this._title??this.name;}
    set title(v){this._title = v;}
    constructor(){
        this.name = "undefined";
        this.body = "undefined";
    }
    setName(v: string){ this.name = v; return this; }
    setTitle(v: string){ this.title = v; return this; }
    setBody(v: string){ this.body = v; return this; }
    setImage(v: string){ this.image = v; return this; }
    setLink(v: string){ this.link = v; return this; }
    setMetaURI(v: string){ this.metaURI = v; return this; }
    addAliases(v: string){ this.aliases.push(v); return this; }
    toYaml(){
        const {name, _title, link, body, aliases, image} = this;
        return stringify({name, title: _title, image, link, aliases, body});
    }
}
export const FAQ_MANAGER = new FAQManager();