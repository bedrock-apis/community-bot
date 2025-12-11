
import {XMLParser} from "fast-xml-parser";
import { type BedrockAPIsBot } from "../main";

export async function setup(bot: BedrockAPIsBot): Promise<void>{
    
}

function valueOf(obj: any): any{
    if(obj[':@']){
        // attributes code
    }
    if(obj["#text"]) return String(obj["#text"]);
    if(obj["Text"]) return {type: 10, content: valueOf(obj["Text"][0])??"<null>"}
    if(obj["Container"]) return {type: 17, components: Array.from(obj["Container"]??[]).map(valueOf)}
    if(obj["MediaGallery"]) return {type: 12, items: Array.from(obj["MediaGallery"]??[]).map(valueOf)}
    if(obj["MediaItem"]) return {media: {url: valueOf(obj["MediaItem"][0])??"<null>"}}
    return null;
}