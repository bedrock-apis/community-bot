import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder } from "discord.js";
import { client } from "../../discord";
import { GUILD_IDS } from "../../features";
import { PRE_LOAD } from "../project-loader";

let currentId = 0n;
const tasks = new Map();
PRE_LOAD.subscribe(()=>tasks.clear());
client.onButtonPress.subscribe(async (id,interaction)=>{
    if(id.startsWith("faq-")){
        const [prefix, kind, uid, userId] = id.split("-");
        const uuid = BigInt(uid);
        if(interaction.user.id !== userId) interaction.reply({
            ephemeral: true,
            content: `This action is not binded to you, you can't use this action`
        })
        else if(tasks.has(uuid)){
            const data = tasks.get(uuid) as {header:string; data:string, message:string};
            tasks.delete(uuid);
            interaction.reply({
                ephemeral: true,
                content: `${kind}: ${JSON.stringify(data.message)}`
            });
        } else interaction.reply({
            ephemeral: true,
            content: `You runned out of time or you already trigger action before, please use Manage FAQ again.`
        });
    }
});
client.registryCommand(
    new ContextMenuCommandBuilder().setType(ApplicationCommandType.Message).setName("Manage FAQ"),
    async (client, commandName, interaction)=>{
        //@ts-ignore
        const m = interaction.targetMessage;
        if(m.content?.length > 2){
            const message = m.content as string;
            const [header] = message.split("\n");
            const data = message.substring(header.length + 1);
            const i = currentId++;
            const userId = interaction.user.id;
            const id = `${i}-${userId}`;
            interaction.reply({
                content:"Data: " + data,
                components:[
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("faq-add new-" + id).setStyle(ButtonStyle.Success).setLabel("Add New"),
                        new ButtonBuilder().setCustomId("faq-edit-" + id).setStyle(ButtonStyle.Primary).setLabel("Edit"),
                        new ButtonBuilder().setCustomId("faq-delete-" + id).setStyle(ButtonStyle.Danger).setLabel("Delete"),
                    ) as any
                ]
            });
            tasks.set(i, {header,data,message});
            setTimeout(()=>tasks.delete(i), 30*1000);
        }else{
            interaction.reply({
                ephemeral: true,
                content: "Your message must containts at least 5 characters"
            })
        }
    },
    GUILD_IDS
)