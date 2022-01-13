import { NextApiHandler } from "next";
import { botsocket } from "src/lib/api/bot/BotSocketManager";

const handler: NextApiHandler = async (_req, res) => {
    res.status(200).send({
        ok: true,
    });

    if (!botsocket.started && !botsocket.starting) await botsocket.start();
    if (botsocket.starting)
        await new Promise<void>((resolve) => {
            const v = setInterval(() => {
                if (botsocket.started && !botsocket.starting) {
                    clearInterval(v);
                    resolve();
                }
            }, 3000);
        });
};

export default handler;
