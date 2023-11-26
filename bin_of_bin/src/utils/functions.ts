export function GenerateUUID() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
export function hasCodeBlock(str: string,lang: string = "") {
    const start = str.indexOf(`\`\`\`${lang}`);
    const end = str.indexOf('```', start + lang.length + 3);
    return start !== -1 && end !== -1;
}
export function extractCodeBlock(str: string,lang: string = "") {
    const start = str.indexOf(`\`\`\`${lang}`);
    const end = str.indexOf('```', start + lang.length + 3);
    if (start === -1 || end === -1) {return null;}
    return str.slice(start + lang.length + 3, end).trim();
}