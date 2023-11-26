const JSZip = require("jszip");

const date = (d = new Date)=>`${d.getMonth()+1}/${d.getDate()}/${d.getYear() + 1900} - ${d.getHours()}:${d.getMinutes()}`;
const parsers = {
    name(manifest,value){
        manifest.header.name = value + "";
    },
    description(manifest, value){
        manifest.header.description = date() + " " + value;
    },
    dependency(manifest, value){
        manifest.dependencies = manifest.dependencies??[];
        const [module_name, version] = value?.split?.("_")??[];
        if(!module_name) return;
        const dep = module_name.startsWith("@")?{module_name,version}:{uuid:module_name,version};
        manifest.dependencies.push(dep);
    },
    version(manifest, value){
        manifest.header.version = value??"0.0.1";
    }
}
function GenerateManifest(name,description,module,dependencies=[],min_engine_version = [1,20,0]){
    return {
        format_version: 2,
        header:{
            name,
            description: name + `, ${date()} ,` + description,
            uuid:generateUUID(),
            min_engine_version,
            version:"1.0.0",
        },
        modules:[Object.assign({version:[1,0,0],uuid:generateUUID(),type:"data",description:""},module)],
        dependencies
    };
}
function hasProperties(str){
    const start = str.indexOf(`///`);
    const end = str.indexOf('///', start + 3);
    return start !== -1 && end !== -1;
}
function getProperties(str){
    const start = str.indexOf(`///`);
    const end = str.indexOf('///', start + 3);
    if (start === -1 || end === -1) {
        return null;
    }
    return str.slice(start + 3, end).trim();
}
function BuildMCPackFromJS(indexFile){
    let stringData = indexFile.toString();
    let manifest = GenerateManifest("","",{type:"script",entry:"scripts/index.js"});
    if(hasProperties(stringData)) {
        let definitionLine = getProperties(stringData);
        for (const def of definitionLine.split("|")) {
            if(def.length<=3) continue;
            let [name,value] = def.split("=");
            if(!value) continue;
            name = name.replace(" ","").toLowerCase();
            if(name in parsers){
                parsers[name](manifest,value);
            }
        }
    }
    return ZipData({
        "manifest.json":JSON.stringify(manifest,null,"  "),
        "scripts/index.js":indexFile
    });
}
function ZipData(data){
    const zip = new JSZip();
    for (const fileName of Object.getOwnPropertyNames(data)) {
        zip.file(fileName,data[fileName]);
    }
    return zip.generateAsync({type:"nodebuffer"});
}

module.exports = {
    generateUUID,
    ZipData,
    BuildMCPackFromJS,
    GenerateManifest
}