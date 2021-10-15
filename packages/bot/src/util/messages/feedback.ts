import { captureException } from "@sentry/node";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import ManagersManager from "src/managers/common/ManagersManager";
import { defaultEmbed } from "src/util/messages/embeds";
import { red } from "tailwindcss/colors";

export function userErrorReport(
    error: any,
    managers: ManagersManager,
): Parameters<typeof IncomingSlashCommand.prototype.reply> {
    const formattedError = `\`\`\`${
        "message" in error ? error.message : error
    }\`\`\``;

    if (formattedError.toLowerCase().includes("error: "))
        captureException(error);

    return [
        {
            embeds: [
                defaultEmbed()
                    .setTitle(`Whoops! There was a problem.`)
                    .setDescription(
                        formattedError.toLowerCase().includes("error: ")
                            ? `This error has been logged and will be corrected soon!`
                            : `Please check your input and try again. If this doesn't help, [get support](${managers.bot.config.bot.supportLink})`,
                    )
                    .addField("For nerds", formattedError)
                    .setColor(red["500"] as `#${string}`),
            ],
        },
    ];
}
