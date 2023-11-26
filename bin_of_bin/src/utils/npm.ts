import {DownloadContent} from "./downloads";
import path from "path";
const hostname = "www.npmjs.com";
const Cookie = "__cf_bm=PmxtRuCzikgIxwBIRm9aSOvt2XhBOQjFqYEVoIoG6_I-1691598609-0-AUT4OHWIoMqbkmb6V/5fsK5SjGXBTDfXjRno/QWvhSbIlEntbSuWFlsq6fRQWUy/c+P7pJF4guh1pxnaCXcmkCw=; __cfruid=167f9e121c73a8e84cbd7740660407ec0dc8dbdc-1691598609";
const header = {"x-spiferack":1};
export class Developer{
    readonly name: string;
    readonly avatarSmall: string;
    readonly avatarMedium: string;
    readonly avatarLarge: string;
    constructor(data: any){
       this.name = data.name;
       const {small,medium,large} = data.avatars;
       this.avatarSmall = small;
       this.avatarMedium = medium;
       this.avatarLarge = large;
    }
}
export class PackageFile{
    readonly packageVersion: PackageVersion;
    readonly size: number;
    readonly type: string;
    readonly path: string;
    readonly contentType: string;
    readonly hex: string;
    readonly isBinary: boolean;
    readonly linesCount: number;
    constructor(packageVersion: PackageVersion, data: any){
        this.packageVersion = packageVersion;
        const {
                size,
                type,
                path,
                contentType,
                hex,
                isBinary,
                linesCount
        } = data;
        this.size = size;
        this.type = type;
        this.path = path;
        this.contentType = contentType;
        this.hex = hex;
        this.isBinary = isBinary;
        this.linesCount = linesCount;
    }
    get url(){return `https://${hostname}/package/${this.packageVersion.package.name}/file/${this.hex}`;}
    getData(){return DownloadContent(this.url);}
}
export class PackageVersion{
    readonly package: Package;
    readonly version: string;
    readonly releaseTime: number;
    readonly zipFile: string;
    readonly fileCount: number;
    readonly unpackedSize: number;
    private _files_?: Map<string,PackageFile>
    constructor(parentPackage: Package,data: any){
        this.package = parentPackage;
        this.version = data.version;
        this.releaseTime = data.date.ts;
        const {tarball,fileCount,unpackedSize} = data.dist;
        this.zipFile = tarball;
        this.fileCount = fileCount;
        this.unpackedSize = unpackedSize;
        this._files_ = undefined;
    }
    get isDeprecated(): boolean{return this.package.deprecations.includes(this.version);};
    get files(){
        if(this._files_) return Promise.resolve(this._files_);
        return DownloadContent(`https://${hostname}/package/${this.package.name}/v/${this.version}/index`,{Cookie}).then(data=>{
            const {files} = JSON.parse(data.toString());
            const map = new Map();
            Object.getOwnPropertyNames(files).forEach(n=>map.set(n,new PackageFile(this,files[n])));
            this._files_ = map;
            return this._files_;
        });
    }
    get url(){return this.package.url + "/v/" + this.version}
}
export class Package{
    readonly developers: Developer[] = [];
    readonly name: string;
    readonly description: string;
    readonly LICENSE: string;
    readonly latestVersion: PackageVersion;
    readonly currentVersion: PackageVersion;
    readonly versions: Map<string,PackageVersion>;
    readonly deprecations: string[];
    readonly tags: Map<string,PackageVersion>;
    readonly types: string;
    constructor(data: any){
        const {packument:{name,description,deprecations,maintainers,distTags,license,version:latestVersion,versions},packageVersion:{types}} = data;
        this.types = path.resolve("a://",types).replace("\\","/").substring(2);
        this.name = name;
        this.LICENSE = license;
        this.description = description;
        this.deprecations = deprecations;
        this.developers = maintainers.map((d: any)=>new Developer(d));
        this.tags = new Map();
        this.versions = new Map();
        this.currentVersion = {} as PackageVersion;
        versions.forEach((v: any,index:number)=>{
            const pv = new PackageVersion(this,v);
            if(index === 0) (this as any).currentVersion = pv
            this.versions.set(pv.version,pv);
        });
        Object.getOwnPropertyNames(distTags).map(tag=>this.tags.set(tag,this.versions.get(distTags[tag]) as any));
        this.latestVersion = this.versions.get(latestVersion) as PackageVersion;
    }
    get url(){return `https://${hostname}/package/${this.name}`;}
    static async Load(name: string){
        const data = JSON.parse((await DownloadContent(`https://${hostname}/package/${name}`,header)).toString());
        if(data?.message?.endsWith?.("' not found")) throw new ReferenceError(data.message);
        return new Package(data);
    }
}