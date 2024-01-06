import { getPaths } from "../../features";
import { CONTENT_LOADERS } from "./content-loader"; 

let IMAGES: {[K: string]: string} = {};
export function GET_IMAGES(){return IMAGES;}
CONTENT_LOADERS["resources"] = async function Loader(content: any, paths) {
    if(typeof content.images === "object"){
        const im = content.images;
        for (const key of Object.keys(im)) {
            const v = im[key];
            if(v.startsWith("ref=")) IMAGES[key] = v.substring(4);
            else IMAGES[key] = getPaths(paths.join("/"),v).join("/");
            console.log("[Image-Loader] Loaded:", key);
        }
    }
}