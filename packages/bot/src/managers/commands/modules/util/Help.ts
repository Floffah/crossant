import IncomingSlashCommand from "../../structures/IncomingSlashCommand";
import SlashCommand from "../../structures/SlashCommand";

export default class HelpCommand extends SlashCommand {
    constructor() {
        super("help", "Show the help menu", (s) =>
            s.addStringOption((opt) =>
                opt
                    .setName("command")
                    .setRequired(false)
                    .setDescription(
                        "Command to show information about. For sub commands, do command.subcommand",
                    ),
            ),
        );
    }

    incoming(i: IncomingSlashCommand): void | Promise<void> {
        i.reply("EEEE");
    }
}
