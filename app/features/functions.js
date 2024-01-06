//@ts-nocheck
const {Buffer} = require("node:buffer");
const {GITHUB_NOT_FOUND_MESSAGE} = require("./constants");

module.exports = {
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    async DownloadContent(url, header={}) {
        const {default: fetch,Headers} = await import("node-fetch");
        return Buffer.from(await (await fetch(url,{headers:new Headers(header),redirect:"follow",follow:5})).arrayBuffer());
    },
    async SafeDownloadContent(url, header={}) {
        try {
            const {default: fetch,Headers} = await import("node-fetch");
            return {data:Buffer.from(await (await fetch(url,{headers:new Headers(header),redirect:"follow",follow:5})).arrayBuffer())};
        } catch (error) {
            return {error:error};
        }
    },
    async GetGithubContent(url, header={}){
        try {
            const {default: fetch,Headers} = await import("node-fetch");
            const data = Buffer.from(await (await fetch(url,{headers:new Headers(header),redirect:"follow",follow:5})).arrayBuffer());
            if(data.byteLength === Buffer.from(GITHUB_NOT_FOUND_MESSAGE).byteLength){
                return data.toString() === GITHUB_NOT_FOUND_MESSAGE?null:data;
            }
            return data;
        } catch (error) {
            return null;
        }
    },
    margeColors(color1, color2, alpha) {
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
    },
    getLine(text,index) {
        var perLine = text.split ('\\n');
        var total_length = 0;
        for (i = 0; i < perLine.length; i++) {
            let losangles = total_length;
            total_length += perLine[i].length;
            if (total_length >= index)
                return [i + 1,losangles];
        }
    },
    searchFor(searchText, possibleResults) {
        let matchCounts = {};
        for (let i = 0; i < possibleResults.length; i++) {
          const currentResult = possibleResults[i];
          let matchCount = 0;
          for (let j = 0; j < searchText.length; j++) {
            if (currentResult.includes(searchText[j])) {
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
    },
    getPaths(root, pathLike){
        const paths = pathLike.split("/");
        if(paths[0] === "."){ 
            paths[0] = root;
            return paths;
        } else {
            return [root, ...paths];
        }
    },
    hasCodeBlock(str, lang = "") {
        const start = str.indexOf(`\`\`\`${lang}`);
        const end = str.indexOf('```', start + lang.length + 3);
        return start !== -1 && end !== -1;
    },
    extractCodeBlock(str, lang = "") {
        const start = str.indexOf(`\`\`\`${lang}`);
        const end = str.indexOf('```', start + lang.length + 3);
        if (start === -1 || end === -1) {return null;}
        return str.slice(start + lang.length + 3, end).trim();
    }
}