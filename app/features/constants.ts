export const GITHUB_NOT_FOUND_MESSAGE = "404: Not Found";
export const BOT_RESOURCES_REPO_ROOT_RAW = process.env["DEV_RESOURCES"]??"https://raw.githubusercontent.com/bedrock-apis/bot-resources/main";
export const BDS_VERSIONS_GIT_FILE = "https://raw.githubusercontent.com/Bedrock-OSS/BDS-Versions/main/versions.json";
export const EMBED_BACKGROUND = 0x2b2d31;
export const MAIN_GUILD = process.env["DEV_GUILD_ID"]??"1138527696310251681"; //Bedrock API's server id
export const MAIN_CHANNEL_ID = process.env["DEV_CHANNEL_ID"]??"1196850395348205728"; //bot managing channel
export const CANCEL_EMOJI_IDENTIFIER = "%F0%9F%9A%AB";
export const CANCEL_REACTION_TIMEOUT = 15_000;
export const DEBUG = process.env["DEBUG"]??false;
export const GUILD_IDS = [
    MAIN_GUILD
]