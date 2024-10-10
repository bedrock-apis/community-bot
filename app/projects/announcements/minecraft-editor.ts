import { client } from "../../discord";
import { GetGuildInfos } from "../general";
import { AFTER_LOAD } from "../project-loader";

let channel: string | null = null;
let updatesRole: string | null = null;
AFTER_LOAD.subscribe(async ()=>{
    for (const [k,v] of Object.entries(GetGuildInfos())) {
        if(v.isOwner && v.editorUpdates?.length > 10){
            channel = v.editorUpdates;
            updatesRole = v.editorUpdatesRole;
            return;
        }
        else channel = null;
    }
});
setInterval(()=>{
    if(!channel) return;
    Run(channel);
}, 15*60*1000); //15min

AFTER_LOAD.subscribe(()=>{
  if(!channel) return;
  Run(channel);
});


async function Run(channel: string) {
    let data = await fetch("https://api.github.com/repos/Mojang/minecraft-editor/discussions?page=99999");
    const links = data.headers.get("link")!.split(",").filter(e=>e.includes("last"));
    const pageNum = links.map(e=>e.match(/page?=\d+/g)?.[0].match(/\d+/g))[0]??1;
    let pages = await fetch("https://api.github.com/repos/Mojang/minecraft-editor/discussions?page=" + pageNum);
    let ps = (await pages.json() as any).filter((e: any)=>e.category.id == 38720903) as any[]; //Announcement category
    //console.log(pages.map(e=>e.title));
    //console.log(pages.at(-1).body);
    const page = ps.at(-1);
    if(!page) return;
    const {title, body, created_at} = page??{};
    if(body == undefined) return;
    const date = new Date(created_at).getTime();
    const lastTime = client.cache.get("editor_last_post_time")??0;
    if(date <= lastTime) return;
    await Post(page, channel);
    client.cache.set("editor_last_post_time", date);
}
async function Post(page: any, channel: string){
    const {title, body, created_at, html_url, user: {login, avatar_url,html_url:userUrl}} = page;
    const images = [...body.matchAll(/\<img ([^\<\>])+ src="([^"]+)"\>/g)].map(e=>{
        return e[2];
    });
    [...body.matchAll(/!\[.*?\]\((https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+)\)/g)].forEach(e=>{
      images.push(e[1]);
    });
    const maxBodySize = 4096 - 10;
    const buildedBody = body.replaceAll("---","").replaceAll(/((?<!\()https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9\-]{36}(?!\))|(!\[.*?\]\(https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+\)))/g,"").replaceAll(/\<img ([^\<\>])+\>/g,"").replaceAll("  "," ").replaceAll(/^\s*/mg,"").replaceAll("##","###").replaceAll(/(\r|\n|\r\n)/g,"\n")
    const parts = buildedBody.split("\n");
    let result = "";
    let currentSize = 0;
    let index = 0;
    for(const part of parts){
      currentSize += part.length + 1;
      index++;
      if(currentSize >= maxBodySize) index--;
    }
    
    result = parts.slice(0, index).join("\n");
    result += "\n. . .";

    const main = 
    {
      "timestamp": created_at,
      "title": "**" + title + "**",
      "description": result,
      "url": html_url,
      "color": null,
      "author": {
        "name": login,
        "url": userUrl,
        "icon_url": avatar_url
      }
    } as any;
    const embeds = [main];
    if(images[0]){
        main.image = {
          "url": images[0]
        }
    }
    for (const element of images.slice(1)) {
        embeds.push(
            {
              "url": html_url,
              "image": {
                "url": element
              }
            }
        )
    }
    const response = await fetch("https://discord.com/api/v10/channels/" + channel + "/messages", {
        method: "POST", 
        headers: new Headers({
            Authorization:"Bot " + client.token,
            "Content-Type":"application/json"
        }),
        body: JSON.stringify(
            {
                "content": (updatesRole?`# <@&${updatesRole}>`:""),
                "embeds": embeds,
                "attachments": []
              }
            )
    });

    if(!response.ok) {
      console.log(await response.json());
      throw new Error("Faild to send editor apis, update: ");
    }

    const videos = [...body.matchAll(/(?<!\()https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9\-]{36}(?!\))/g)??[]];

    if (videos.length) await fetch("https://discord.com/api/v10/channels/" + channel + "/messages", {
      method: "POST", 
      headers: new Headers({
          Authorization:"Bot " + client.token,
          "Content-Type":"application/json"
      }),
      body: JSON.stringify(
          {
              "content": ["## Related Videos",...videos.map(e=>" - " + e)].join("\n"),
              "attachments": []
            }
          )
    });
    const message = await response.json() as any;
    if(message) {
        await fetch(
          `https://discord.com/api/v10/channels/${channel}/messages/${message.id}/crosspost`,
          {
            method: "POST", 
            headers:new Headers({
                Authorization:"Bot " + client.token,
                "Content-Type":"application/json"
            }),
          }
        ).then(e=>e.json());
    }
}