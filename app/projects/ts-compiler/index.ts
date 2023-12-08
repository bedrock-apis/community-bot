import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, MessageContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";
import { client } from "../../discord";
import {load,compile} from "./compile-code";
import { EmbedBuilder, ContextMenuCommandBuilder } from "@discordjs/builders";
import { getLine, margeColors } from "../../features";
import ts from "typescript";

const components = (id: string)=>new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("reload-debug-results-"+id).setLabel("Reload").setStyle(ButtonStyle.Danger)) as any;
client.onReload.subscribe(load);
client.onButtonPress.subscribe(async (id,interaction)=>{
    if(id.startsWith("reload-debug-results-")){
        //->
        const r = id.substring("reload-debug-results-".length);
        const a = await interaction.message.channel.messages.fetch(r);
        const embeds = buildEmbeds(a.content??"");
        await interaction.reply({
            content:"",
            embeds: embeds,
            components: [components(r)]
        });
    }
})
client.registryCommand(
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message).setName("debug-code"),
    async (client, commandName, interaction)=>{
        //@ts-ignore
        const m = interaction.targetMessage;
        const code = m.content;
        const t = interaction.deferReply();
        const embeds = buildEmbeds(code);
        await t;
        const a = await interaction.editReply({embeds: embeds,components:[components(m.id)]});
    }
)
function buildEmbeds(code: string, embeds: EmbedBuilder[]  = []){
    let psu = 18048;
    try {
        const diagnostics = compile(code).filter(e=>e.file?.fileName === "index.ts");
        const warnings = diagnostics.filter(e=>e.code === psu || e.category === ts.DiagnosticCategory.Warning);
        const errors = diagnostics.filter(e=>e.code !== psu && e.category === ts.DiagnosticCategory.Error);
        if(errors.length) {
            let lexs = errors.map(e=>{
                const text = typeof e.messageText === "string"?e.messageText:e.messageText.messageText;
                const [line,size] = getLine(code,e.start??0);
                const n = ((e.start??0) - size)+"";
                return `${line}:${n + " ".repeat(Math.max(4 - n.length,0))} TS${e.code} - ${text}`;
            }).slice(0,15).join("\n");
            const e = new EmbedBuilder().setColor(margeColors(0xbb0000,0x2b2d31,0.1)).setTitle(`Errors`)
            if(errors.length > 10) {
                e.setFooter({
                    text: errors.length + " errors"
                })
                lexs+="\n..."
            }
            embeds.push(e.setDescription("```properties\n" + lexs +"\n```"));
        }
        if(warnings.length){
            let lexs = warnings.map(e=>{
                const text = typeof e.messageText === "string"?e.messageText:e.messageText.messageText;
                const [line,size] = getLine(code,e.start??0);
                const n = ((e.start??0) - size)+"";
                return `${line}:${n + " ".repeat(Math.max(4 - n.length,0))} TS${e.code} - ${text}`;
            }).slice(0,15).join("\n");
            const e = new EmbedBuilder().setColor(margeColors(0xbb7700,0x2b2d31,0.1)).setTitle(`Warnings`).setDescription("```properties\n" + lexs +"\n```");
            if(warnings.length > 10) {
                e.setFooter({
                    text: warnings.length + " warnings"
                })
                lexs+="\n..."
            }
            embeds.push(e.setDescription("```properties\n" + lexs +"\n```"));
        }
        if(warnings.length === 0 && errors.length === 0){
            embeds.push(
                new EmbedBuilder().setColor(margeColors(0x009900,0x2b2d31,0.1)).setTitle(`No errors found`)
            );
        }
    } catch (error) {
        embeds.push(
            new EmbedBuilder().setColor(margeColors(0x009900,0x2b2d31,0.1)).setTitle(`Something went wrong`).setDescription("```js\n" + code + "\n```")
        );
    }
    return embeds;
}