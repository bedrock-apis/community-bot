import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { client } from "../../discord";

const manageThreads = PermissionsBitField.Flags.ManageThreads;

client.registryCommand(
    new SlashCommandBuilder().setName("resolve").setDescription("Mark this forum as resolved, and closes this thread"),
    async (client, text, interaction)=>{
        const thread = interaction.channel;
        if(!thread || !thread.isThread() || !thread.parent?.isThreadOnly()) return await interaction.reply({content: "You are not in forum port, this command doesn't work outside of forum.", ephemeral: true}); 
        if(thread.archived || thread.locked)  return await interaction.reply({content: "This post/thread is locked or archived.", ephemeral: true}); 
        if(interaction.user.id !== thread.ownerId && ((interaction.memberPermissions?.bitfield??0n) & manageThreads) !== manageThreads) return await interaction.reply({content: "You are not original poster or you dont have permission to close these threads.", ephemeral: true});
        
        const resolveTag = thread.parent.availableTags.find(e=>e.name.toLowerCase().includes("resolve") || e.name.toLowerCase().includes("done"));
        if(!resolveTag)  return await interaction.reply({content: "This forum doesn't have `resolve` tag.", ephemeral: true});
        const tags = new Set(thread.appliedTags??[]);
        tags.add(resolveTag.id);
        if(tags.size !== thread.appliedTags?.length) await thread.setAppliedTags([...thread.appliedTags, resolveTag.id]);
        await interaction.reply({
            embeds:[
                new EmbedBuilder().setColor("DarkGreen").setTitle("Resolved").setDescription("This thread has been succesfully resolved.")
            ]
        });
        setTimeout(()=>thread.setArchived(true), 1000);
    }
);