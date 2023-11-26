import fetch, {Headers} from "node-fetch";

export async function DownloadContent(url: string, header:{[key: string]:any}={}): Promise<Buffer>{
    return (await fetch(url,{headers:new Headers(header),redirect:"follow",follow:5})).buffer();
}