import { Client } from "./discord";

const client = new Client();

client.login(process.env.DISCORD_TOKEN);