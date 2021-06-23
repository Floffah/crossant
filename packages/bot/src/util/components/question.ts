import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageButtonStyle,
    MessageComponentInteraction,
    Snowflake,
    User,
} from "discord.js";
import { Sendable, SendableChannel } from "../channels";
import { defaultEmbed } from "../embeds";
import Bot from "../../bot/Bot";

export type QuestionData = ButtonQuestion;

export interface BaseQuestion {
    type: "button";
    data: any;
    question: string;
}

export interface ButtonQuestion extends BaseQuestion {
    type: "button";
    data: ButtonQuestionButtonData[];
}

export interface ButtonQuestionButtonData {
    style: MessageButtonStyle;
    url?: string;
    emoji?: string;
    label: string;
}

export interface AnswerData {
    raw?: string;
}

export async function startQuestion(
    channel: Sendable,
    users: User[],
    question: QuestionData,
    _bot: Bot,
    reuse?: Message,
) {
    let ch: SendableChannel;
    if (channel instanceof User) {
        if (!channel.dmChannel) {
            ch = await channel.createDM();
        } else {
            ch = channel.dmChannel;
        }
    } else {
        ch = channel;
    }
    if (!ch) throw "No sendable channel found";
    const u: Snowflake[] = [];

    for (const user of users) {
        u.push(user.id);
    }

    const answer: AnswerData = {};

    if (question.type === "button") {
        const ids: string[] = [];

        const btns: MessageButton[] = [];

        for (const btn of question.data) {
            const id = btn.label.toLowerCase().replace(/\W/g, "_");
            ids.push(id);

            btns.push(
                new MessageButton({
                    style: btn.style,
                    url: btn.url,
                    type: "BUTTON",
                    customID: id,
                    label: btn.label,
                    disabled: false,
                }),
            );
        }

        let msg: Message | undefined = reuse;

        const embed = defaultEmbed().setTitle(question.question);
        const msgdata = {
            embeds: [embed],
            content: "Click one of the buttons below",
            components: [
                new MessageActionRow({
                    components: btns,
                    type: "ACTION_ROW",
                }),
            ],
        };

        if (!msg) {
            const sent = await ch.send(msgdata);
            if (Array.isArray(sent)) throw "WHOOPS?";
            msg = sent;
        } else if (msg) {
            await msg.edit(msgdata);
        }

        if (typeof msg === "undefined") throw "How did we get to this point";

        const filter = (c: MessageComponentInteraction) =>
            !!c.channel &&
            c.channel.id === ch.id &&
            u.includes(c.user.id) &&
            ids.includes(c.customID) &&
            !!msg && // because typescript loves to complain
            (() => {
                if (!(c.message instanceof Message)) return false;
                return (c.message as Message).id === msg.id;
            })();

        const c = (
            await ch.awaitMessageComponentInteraction(filter)
        );

        if (!c) throw "No collection in collected";

        if (msgdata.components && msgdata.components[0].components) {
            for (const comp of msgdata.components[0].components) {
                comp.disabled = true;
            }
            await c.update(msgdata);
        }
        answer.raw = ids.indexOf(c.customID) + "";
    }

    return answer;
}
