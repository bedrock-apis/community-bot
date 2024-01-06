import { client } from "../../discord";
import { searchFor } from "../../features";

const searches = [
    "test",
    "last",
    "apis",
    "script api",
    "not even close",
    "supper dupper",
    "amongus",
    "minecraft bedrock engine",
    "yep thats it",
    "lmaos"
]

client.on("messageCreate",(e)=>{
    if(e.content.startsWith("??")) {
        const text = e.content.replaceAll(/^\?\?([ ]+|)/g,"");
        e.reply({content:searchFor(text, searches)});

    }
});