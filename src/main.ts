import {Bot, DiscordApplicationCommandUpdateRequest, DiscordSnowflakeType, Result} from "discord-dependless";

export class BedrockAPIsBot extends Bot {
    public applicationId?: DiscordSnowflakeType;
    public constructor(token: string){
        super({token});
    }
    public async login(): Promise<{
        applicationId: DiscordSnowflakeType
    }>{
        // IntentBits required for specific permission and events to get fired
        const gateway = await this.connect(0);

        let _callback;
        // Wait for ready event
        const {id} = await new Promise<{id: DiscordSnowflakeType, flags: number}>(res=>gateway.addEventListener("READY", _=>{
            res(_.data.application);
            this.applicationId = _.data.application.id;
        }));

        //return application id
        return {applicationId:id};
    }
    public async setCommands(commands: DiscordApplicationCommandUpdateRequest[]): Promise<void>{
        if(!this.applicationId)
            throw new ReferenceError("Bot is not ready yet");

        await Result.unwrap(this.setApplicationCommands(this.applicationId, commands));
    }
}