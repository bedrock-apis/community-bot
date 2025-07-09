# USED ENVIRONMENT
 - "LOGS_ENABLED": boolean, use to disable/enable file logging (optional)
 - "LOGS_FOLDER": string, path to save logs (optional)
 - "DISCORD_BOT_TOKEN": string, token for discord bot (* required)


## Setup your testing development
 - Add file to the `./tests/` named `test.data.json` with this format
  ```json
  {
    "token":"<your discord bot token>"
  }
  ```
 - run command "npm run dev" to start your bot