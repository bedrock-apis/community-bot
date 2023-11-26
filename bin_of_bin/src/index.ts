/*import { settings } from "./load";
import {BDSAnnouncementMessage, PackageAnnouncementMessage, client} from "./discord";
import { bdsTask } from "./updates";*/
import "./changelog_generator";
/*
client.login(settings.token);


settings.development?setTimeout(()=>{
    client.destroy();
},1*60*1000):null;
/*
const npmTaskId = npmTask(async (pack,version)=>{
    const guild = client.guilds.cache.get(data.guildId);
    if(!guild) return;
    const channel = guild.channels.cache.get(data.channels.npm_announcements);
    if(!channel) return;
    if(channel.isTextBased()){
        const message = await channel.send(PackageAnnouncementMessage(version));
        if(message.crosspostable) message.crosspost();
    }
},0.5*60*1000);
const bdsTaskId = bdsTask( async (version,isPreview)=>{
    const guild = client.guilds.cache.get(data.guildId);
    if(!guild) return;
    const channel = guild.channels.cache.get(data.channels.bds_announcements);
    if(!channel) return;
    if(channel.isTextBased()){
        const message = await channel.send(BDSAnnouncementMessage(version,isPreview));
        if(message.crosspostable) message.crosspost();
    }
},0.5*60*1000);*/