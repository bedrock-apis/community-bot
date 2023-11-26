import {promises,existsSync} from "fs";
import type { TaskModule } from ".";
import { settings } from "../load";
import { DownloadContent } from "../utils";

export default ((callBack,interval=1000*60*5)=>{
    return setInterval(async ()=>{
        try {
            const dataFile = settings.data.files.bds_data;
            if(!existsSync(dataFile)) await promises.writeFile(dataFile,JSON.stringify({stable:"",preview:""}));
            const data = JSON.parse((await promises.readFile(dataFile)).toString("utf-8"));
            const {stable,preview} = data;
            const {windows} = JSON.parse((await DownloadContent("https://raw.githubusercontent.com/Bedrock-OSS/BDS-Versions/main/versions.json?raw=true")).toString());
            if(stable!==windows.stable){
                try {
                    await callBack(windows.stable as string,false);
                } catch (error: any) {
                    console.error("[Updates][BDS] Failed to execute callback: ",error,error.stack);
                }
            }
            if(preview!==windows.preview){
                try {
                    await callBack(windows.preview as string,true);
                } catch (error: any) {
                    console.error("[Updates][BDS] Failed to execute callback: ",error,error.stack);
                }
            }
            await promises.writeFile(dataFile,JSON.stringify({stable:windows.stable,preview:windows.preview}));
        } catch (error) {
            console.error("BDS update failed.");
        }
    },interval);
}) as TaskModule<[string,boolean]>;