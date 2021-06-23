import { QuestionData, startQuestion } from "./question";
import { Sendable } from "../channels";
import { User } from "discord.js";
import Bot from "../../bot/Bot";

export type FormData = (QuestionData & { name: string })[];

export async function startForm(
    channel: Sendable,
    users: User[],
    form: FormData,
    bot: Bot,
) {
    const answers: { [k: string]: any } = {};

    for (const question of form) {
        const a = await startQuestion(channel, users, question, bot);

        answers[question.name] = a.raw;
    }

    return answers;
}
