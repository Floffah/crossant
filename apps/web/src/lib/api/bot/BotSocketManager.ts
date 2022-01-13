import axios from "axios";

export default class BotSocketManager {
    started = false;
    starting = false;

    twitchAccessToken?: string;

    async start() {
        this.starting = true;

        const appaccess = await axios.post<{
            access_token: string;
            refresh_token: "";
            expires_in: number;
            scope: [];
            token_type: "bearer";
        }>(
            `https://id.twitch.tv/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        );

        if (!("access_token" in appaccess.data))
            throw "Twitch didnt return an access token";
        this.twitchAccessToken = appaccess.data.access_token;

        this.started = true;
        this.starting = false;
    }
}

export const botsocket = new BotSocketManager();
