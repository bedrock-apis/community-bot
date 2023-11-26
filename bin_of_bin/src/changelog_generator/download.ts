import fetch from "node-fetch";
import stream from "stream/promises";
import fs from "fs";
export const subdownload = "./bds-trash";

export async function Download(VERSION: string, TYPE: "win" | "linux", PREVIEW = false){
    const {Extract} = await import("unzip-stream");
    const response = await fetch(`https://minecraft.azureedge.net/bin-${TYPE}${PREVIEW?"-preview":""}/bedrock-server-${VERSION}.zip`);
    await stream.pipeline(
        response.body,
        Extract({ path: subdownload }),
    );
}
export async function CleanUp() {
    if(fs.existsSync(subdownload)) await fs.promises.rm(subdownload,{force:true,recursive:true});
}