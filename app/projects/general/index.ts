import { MessageFlags, MessageType } from "discord.js";
import { client } from "../../discord";
import { CONTENT_LOADERS } from "../project-loader";
import * as JSON from "comment-json";

let data: {[k: string]: GuildInfo} = {};
async function Loader(obj: any, path: string[], index: string){
    data = {};
    for(const k of Object.keys(obj)) if(k!=="type") data[k] = new GuildInfo(obj[k]);
}
CONTENT_LOADERS["bot-info"] = Loader;
client.onStats.subscribe(()=>{
    return `known-guilds: ${Object.keys(data).length}`;
})

export class GuildInfo{
    public allowFAQ?: boolean;
    public faqChannels: {[k: string]: boolean};
    public faqManagers: {[k: string]: boolean};
    public sendWelcomeSquadRole?: string;
    constructor(data: any){
        this.allowFAQ = data["allow-faq"]??false;
        this.faqChannels = data["faq-channels"]??{};
        this.faqManagers = {};
        this.sendWelcomeSquadRole = data["welcome-squad"]??"";
        if(Array.isArray(data["faq-management"])) for(const k of data["faq-management"]) 
            if(typeof k === "string") this.faqManagers[k] = true;
            else console.warn("[GENERAL-INFO]","Invalid faqManager value: " + k);
        else console.warn("[GENERAL-INFO]","faq-management is not an array");
    }
}
export function GetGuildInfos(){return data;}
export function ParseStr(v: string){return v.split("#")[0];}
Loader.jsonParse = function parseJson(v: string){return JSON.parse(v, (k, value)=>{
    if(typeof value === "string") return ParseStr(value);
    else return value;
});}

client.on("messageCreate", async (message)=>{
    if(message.type != MessageType.UserJoin) return;
    const guildData = data[message.guildId??"0"];
    if(!guildData) return;
    if(typeof guildData.sendWelcomeSquadRole !== "string" || guildData.sendWelcomeSquadRole.length <= 10) return;
    const user = `<@${message.author.id}>`;
    const role = `<@&${guildData.sendWelcomeSquadRole}>`;
    message.reply({
        content: welcomeMessages[Math.floor(welcomeMessages.length * Math.random())].replaceAll("@newcomer", user).replaceAll("@greetingsquad", role)
    });
});
const welcomeMessages = [
    "Welcome aboard, @newcomer! 🎉\n-# Hey @greetingsquad, let's give a warm welcome!",
    "Hello, @newcomer! We're thrilled to have you with us.\n-# Hey @greetingsquad, roll out the welcome mat!",
    "Welcome, @newcomer! 🌟\n-# Hey @greetingsquad, let's make @newcomer feel at home!",
    "Hey there, @newcomer! Great to see you.\n-# Hey @greetingsquad, let's show some love!",
    "Welcome, @newcomer! 🎊\n-# Hey @greetingsquad, let's give a big cheer!",
    "Hi, @newcomer! We're excited to have you here.\n-# Hey @greetingsquad, let's give a hearty welcome!",
    "Welcome, @newcomer! 🌟\n-# Hey @greetingsquad, let's make this a memorable welcome!",
    "Hello, @newcomer! So glad you joined us.\n-# Hey @greetingsquad, let's give a warm round of applause!",
    "Welcome, @newcomer! 🎉\n-# Hey @greetingsquad, let's roll out the red carpet!",
    "Hey, @newcomer! Welcome to the team.\n-# Hey @greetingsquad, let's give a big, warm welcome!",
    "Welcome, @newcomer! 🎉\n-# Hey @greetingsquad, let's make some noise!",
    "Hi, @newcomer! We're so happy to have you.\n-# Hey @greetingsquad, let's give a grand welcome!",
    "Hello, @newcomer! 🌟\n-# Hey @greetingsquad, let's make @newcomer feel special!",
    "Welcome, @newcomer! 🎊\n-# Hey @greetingsquad, let's give a standing ovation!",
    "Hey, @newcomer! Great to have you here.\n-# Hey @greetingsquad, let's give a warm embrace!",
    "Welcome, @newcomer! 🌟\n-# Hey @greetingsquad, let's make this a day to remember!",
    "Hi, @newcomer! We're delighted to see you.\n-# Hey @greetingsquad, let's give a hearty cheer!",
    "Hello, @newcomer! 🎉\n-# Hey @greetingsquad, let's give a thunderous welcome!",
    "Welcome, @newcomer! 🌟\n-# Hey @greetingsquad, let's make @newcomer feel right at home!",
    "Hey, @newcomer! Welcome aboard.\n-# Hey @greetingsquad, let's give a big, warm welcome!",
    "Hey, @newcomer! Welcome aboard. 🚀\n-# Hey @greetingsquad, let's give a big, warm welcome! 🎉",
    "A warm welcome to you, @newcomer! We're thrilled to have you here. 😊\n-# Hey @greetingsquad, let's show some love! ❤️",
    "Hello and welcome, @newcomer! Great to see you. 👋\n-# Hey @greetingsquad, let's make them feel at home! 🏡",
    "Hi there, @newcomer! You've joined an awesome community. 🌟\n-# Hey @greetingsquad, let's give a hearty welcome! 💪",
    "Greetings, @newcomer! We're excited to have you. 🎊\n-# Hey @greetingsquad, let's roll out the welcome mat! 🏆",
    "Hey there, @newcomer! Welcome to the team. 🤗\n-# Hey @greetingsquad, let's give a warm round of applause! 👏",
    "Welcome aboard, @newcomer! We're happy you're here. 🌈\n-# Hey @greetingsquad, let's make some noise! 🎶",
    "Hiya, @newcomer! Ready for an adventure? 🗺️\n-# Hey @greetingsquad, let's give a big cheer! 🎈",
    "Hello, @newcomer! You've arrived at the right place. 🌍\n-# Hey @greetingsquad, let's give a warm welcome! 🔥",
    "Welcome, @newcomer! Let's make great things happen together. 💡\n-# Hey @greetingsquad, let's show our support! 🙌"
]