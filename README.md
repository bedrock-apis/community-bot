## Setup your development
 - Add your discord bot token to `.\dev.ps1` file
   ```powershell
   $env:DISCORD_TOKEN = "<your-token>";
   npx tsc
   Copy-Item -Path "./app/features/functions.js" -Destination "./bin/features/functions.js"
   Write-Output "Compiled, Running JS"
   node .
   ```
 - run command "npm run dev" to start your bot

## Before commiting changes
 - Check `\app\projects\index.ts` and make sure all experimental features are commented and no imported