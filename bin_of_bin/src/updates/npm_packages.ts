import fs, {promises,existsSync} from "fs";
import type { TaskModule } from ".";
import { settings } from "../load";
import { Package, PackageVersion } from "../utils";

export default ((callBack,interval=1000*60*5)=>{
    return setInterval(async ()=>{
        const dataFile = settings.data.files.npm_data;
        if(!existsSync(dataFile)) await promises.writeFile(dataFile,JSON.stringify({packages:[]}));
        const data = JSON.parse((await promises.readFile(dataFile)).toString("utf-8"));
        for (const packageName of data.packages) {
           const pack = await CheckPackage(packageName,data[packageName]??0).catch(er=>undefined);
           if(!pack) continue;
           data[packageName] = pack.currentVersion.releaseTime;
            try {
               await callBack(pack,pack.currentVersion);
            } catch (error) {
               console.warn("[Warn] RunTask NPM.js: " + error);
            }
           await promises.writeFile(dataFile,JSON.stringify(data,null,"   "));
        }
    },interval);
}) as TaskModule<[Package,PackageVersion]>;
async function CheckPackage(packageName: string, packageTime: number){
   const pack = await Package.Load(packageName);
   if(pack.currentVersion.releaseTime > packageTime) return pack;
}