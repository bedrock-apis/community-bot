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
export function calculateSimilarity(text: string, text2: string){
    const w1l = text.length;
    const w2l = text2.length;
    const matrix = Array.from({ length: w2l + 1 }, () => Array(w1l + 1).fill(0));
    for (let i = 0; i <= w2l; i++) {
        for (let j = 0; j <= w1l; j++) {
            if (i === 0 && j === 0) {
                matrix[i][j] = 0;
            } else if (i === 0) {
                matrix[i][j] = matrix[i][j - 1] + 1;
            } else if (j === 0) {
                matrix[i][j] = matrix[i - 1][j] + 1;
            } else if (text2[i - 1] === text[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                let min = matrix[i - 1][j];
                min = matrix[i - 1][j - 1] < min ? matrix[i - 1][j - 1] : min;
                min = matrix[i][j - 1] < min ? matrix[i][j - 1] : min;
                matrix[i][j] = min + 1;
            }
        }
    }
    return matrix[w2l][w1l];
}
export function searchFor(text: string, possibleResults: string[]){
    let results = [];
    for(const result of possibleResults){
        results.push({
            score: calculateSimilarity(text, result),
            result            
        })
    }
    return results.sort((a, b)=> a.score - b.score);
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