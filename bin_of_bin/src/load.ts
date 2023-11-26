import fs from "fs";

const d = JSON.parse(fs.readFileSync("data.json","utf8")) as DataJson;
d.token = process.env.token??"";
d.useDevelopment = process.env.development === "true";
declare global{
    const data: DataJson
    var development: boolean
}
let development = d.useDevelopment;
let datas = {
    guildId:"566684196396072980",
    roles:{
        npm_announcements:"1071070187350130703",
        bds_announcements:"1071070187350130703"
    },
    channels:{
        npm_announcements:"1139562043867934750",
        nbds_announcements:"1139562043867934750"
    },
    __proto__:d
} as any as DataJson
Object.defineProperty(globalThis,"data",{
    get(){return development?datas:d;}
});
export const settings = {
    get development(){return development;},
    set development(v: boolean){development = v;},
    get token(){return this.data.token},
    get data(){return (development?datas:d)},
    get baseData(){return d;}
};
declare interface DataJson{
    useDevelopment: boolean,
    guildId:string,
    token:string,
    files:{
        npm_data:string,
        bds_data:string
    },
    roles:{[k: string]: string}&{
        npm_announcements: string,
        bds_announcements: string
    },
    channels:{[k: string]: string}&{
        npm_announcements: string,
        bds_announcements: string
    }
}