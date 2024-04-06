import { fileURLToPath } from "url";
import { GITHUB_NOT_FOUND_MESSAGE } from "./constants";
export function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
};
export async function DownloadContent(url: string, headers={}) {
       return Buffer.from(await (await fetch(url,{headers, method:"GET"})).arrayBuffer());
}

export async function SafeDownloadContent(url: string, headers?:{[K: string]: string}): Promise<{ data?: Buffer, error?:any }>{
    try {
        return {data:Buffer.from(await (await fetch(url,{headers, method: "GET"})).arrayBuffer())};
    } catch (error) {
        return {error:error};
    }
}
export async function GetGithubContent(url: string): Promise<Buffer | null>{
    try {
        const data = Buffer.from(await (await fetch(url)).arrayBuffer());
        if(data.byteLength === Buffer.from(GITHUB_NOT_FOUND_MESSAGE).byteLength){
            return data.toString() === GITHUB_NOT_FOUND_MESSAGE?null:data;
        }
        return data;
    } catch (error) {
        return null;
    }
}
export function margeColors(color1: number, color2: number, alpha: number): number{
    var r1 = (color1 >> 16) & 0xff;
    var g1 = (color1 >> 8) & 0xff;
    var b1 = color1 & 0xff;
  
    var r2 = (color2 >> 16) & 0xff;
    var g2 = (color2 >> 8) & 0xff;
    var b2 = color2 & 0xff;
  
    var r = Math.round(alpha * r1 + (1 - alpha) * r2);
    var g = Math.round(alpha * g1 + (1 - alpha) * g2);
    var b = Math.round(alpha * b1 + (1 - alpha) * b2);
  
    return (r << 16) | (g << 8) | b;
}
export function getLine(text: string, length: number): [number, number]{
    var perLine = text.split ('\\n');
    var total_length = 0;
    for (let i = 0; i < perLine.length; i++) {
        let losangles = total_length;
        total_length += perLine[i].length;
        if (total_length >= i)
            return [i + 1,losangles];
    }
    return [0,0];
}
export function searchFor(text: string, possibleResults: string[]){
    let matchCounts = {} as any;
    for (let i = 0; i < possibleResults.length; i++) {
      const currentResult = possibleResults[i];
      let matchCount = 0;
      for (let j = 0; j < text.length; j++) {
        if (currentResult.includes(text[j])) {
          matchCount++;
        }
      }
      matchCounts[currentResult] = matchCount;
    }
    let mostMatchingResult = null;
    let maxMatchCount = 0;
    for (let result in matchCounts) {
      if (matchCounts[result] > maxMatchCount) {
        maxMatchCount = matchCounts[result];
        mostMatchingResult = result;
      }
    }
    return mostMatchingResult;
}
export function getPaths(root: string, pathLike: string): string[]{
        const current = [];
        const paths = pathLike.split("/");
        const roots = root.split("/");
        let isRelate = true;
        for (const path of paths) {
            if(path==".") isRelate = false;
            else if(path==".." && isRelate) roots.pop();
            else current.push(path);
        }
        return [...roots, ...current];
}
export function hasCodeBlock(str: string, lang = "") {
        const start = str.indexOf(`\`\`\`${lang}`);
        const end = str.indexOf('```', start + lang.length + 3);
        return start !== -1 && end !== -1;
    }
export function extractCodeBlock(str: string, lang = "") {
        const start = str.indexOf(`\`\`\`${lang}`);
        const end = str.indexOf('```', start + lang.length + 3);
        if (start === -1 || end === -1) {return null;}
        return str.slice(start + lang.length + 3, end).trim();
    }