import { existsSync, readFileSync, writeFileSync } from "fs";

export class FileCache extends Map<string, any> {
    public readonly path: string;
    public constructor(path: string){
        let data = existsSync(path)?Object.entries(JSON.parse(readFileSync(path).toString("utf-8"))):[];
        super(data);
        this.path = path;
    }
    public set(key: string, value: any){
        let v = super.set(key, value);
        if(this.path) writeFileSync(this.path, JSON.stringify(Object.fromEntries(this.entries())));
        return v;
    }
}