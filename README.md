## Setup your development
 - Add your discord bot token to `.\dev.ps1` file
   ```powershell
   $env:DISCORD_TOKEN = "<your-token>";
   $env:DEV_GUILD_ID = "<dev-guild-id>"; #Required for debugging commands with higher permission
   $env:DEV_CHANNEL_ID = "dev-channel-id";
   $env:DEV_RESOURCES = "https://raw.githubusercontent.com/bedrock-apis/bot-resources/development"; #Your forked resources if you modify code for resource loaders such as FQA or Templates
   npx tsc
   Copy-Item -Path "./app/features/functions.js" -Destination "./bin/features/functions.js"
   Write-Output "Compiled, Running JS"
   node .
   ```
 - run command "npm run dev" to start your bot

## Before commiting changes
 - Check `\app\projects\index.ts` and make sure all experimental features are commented and no imported
 - If you are creating new project for this bot, you should always ask owners for permission