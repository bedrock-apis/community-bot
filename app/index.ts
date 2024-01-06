import { client } from "./discord";
import "./projects";
console.log("YOUR TOKEN: " + process.env.DISCORD_TOKEN);
client.login(process.env.DISCORD_TOKEN);