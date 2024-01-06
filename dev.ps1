$env:DISCORD_TOKEN = "<your-token>";
npx tsc
Copy-Item -Path "./app/features/functions.js" -Destination "./bin/features/functions.js"
Write-Output "Compiled, Running JS"
node .
