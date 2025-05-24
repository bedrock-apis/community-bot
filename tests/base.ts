import { Bot } from "discord-dependless";
import { token } from "./test.data.json" with {type:"json"};

export const bot = new Bot({token});
export {token};