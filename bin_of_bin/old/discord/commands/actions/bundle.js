const { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, EmbedBuilder, Message, AttachmentBuilder } = require("discord.js");
const { hasCodeBlock, extractCodeBlock, DownloadContent } = require("../../../utils");
const { BuildMCPackFromJS } = require("../../../bundler");

const errorEmbedBuild = ()=>new EmbedBuilder().setTitle("Bundler File to Pack").setColor("Red").setDescription("Can't found attachment or code block.");
/**@param {Message} message */
const buildingEmbedBuild = (message)=>new EmbedBuilder().setTitle("Building Your Pack").setDescription(`[source](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`).setColor("Yellow")
/**@param {Message} message */
const successEmbedBuild = (message)=>new EmbedBuilder().setTitle("Building Your Pack").setDescription(`[source](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`).setColor("Green")
const sourceLink = (message)=>`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
const validContentTypes = [
    "application/javascript",
    "text/plain",
];
const build = async (url,name)=>{
    const content = await DownloadContent(url);
    return {data:await BuildMCPackFromJS(content),name};
};
module.exports = {
    definition: new ContextMenuCommandBuilder().setName("bundle").setType(ApplicationCommandType.Message),
    /**@param {MessageContextMenuCommandInteraction} interaction */
    execute: async (interaction)=>{
        const {targetMessage} = interaction;
        if(hasCodeBlock(targetMessage.content,"js")){
            const code = extractCodeBlock(targetMessage.content,"js");
            const content = await BuildMCPackFromJS(code);
            await interaction.reply({
                content: `Generated from [source](<${sourceLink(targetMessage)}>).`,
                files: [
                    new AttachmentBuilder(content,{name:"Generated_Pack.mcpack"}),
                ]
            });
        } else if (targetMessage.attachments.size){
            await interaction.deferReply({
                fetchReply:true
            });
            let doneAttachments = [];
            for (let i = 0; i < targetMessage.attachments.size; i++) {
                const {contentType,url,name} = targetMessage.attachments.at(i);
                if(!contentType) continue;
                if(!validContentTypes.includes(contentType.split(";")[0])) continue;
                doneAttachments.push(build(url,name));
            }
            if(!doneAttachments.length) await interaction.editReply({embeds:[errorEmbedBuild()]});
            else{
                doneAttachments = await Promise.all(doneAttachments);
                await interaction.editReply({
                    content: `Generated from [source](<${sourceLink(targetMessage)}>).`,
                    files:doneAttachments.map(content=>new AttachmentBuilder(content.data,{name:content.name + ".mcpack"}))
                });
            }
        } else {
            await interaction.reply({
                embeds:[errorEmbedBuild()]
            });
        }
    }
};