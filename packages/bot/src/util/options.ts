import {
    ApplicationCommandOption,
    ApplicationCommandOptionChoice,
    Client,
    CommandInteractionOption,
    CommandInteractionOptionResolver,
    Guild,
    GuildMember,
    Snowflake,
    User,
} from "discord.js";

export function optionsToUsage(
    name: string,
    opts: ApplicationCommandOption[],
    prefix = "/",
    groups?: string[],
) {
    let usage = `${prefix}${name}`;

    if (groups) {
        for (const group of groups) {
            usage += ` ${group}`;

            for (const opt of opts) {
                if (
                    ["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(opt.type) &&
                    opt.name === group
                ) {
                    opts = opt.options as ApplicationCommandOption[];
                    break;
                }
            }
        }
    }

    for (const opt of opts) {
        let val = opt.name;

        if (opt.type !== "STRING") {
            let name = "";

            if (opt.type === "INTEGER") name = "number";
            else if (opt.type === "BOOLEAN") name = "yes/no";
            else if (opt.type === "ROLE") name = "@role/id";
            else if (opt.type === "USER") name = "@user/id";
            else if (opt.type === "CHANNEL") name = "#channel/id";
            else name = opt.type.toLowerCase().replace(/_/g, " ");

            val += ` (${name})`;
        }

        if (opt.type === "SUB_COMMAND") usage += "\n";

        if (opt.required) {
            usage += ` <${val}>`;
        } else {
            usage += ` [${val}]`;
        }
    }

    return usage;
}

export async function parseToOptions(
    commandName: string,
    options: ApplicationCommandOption[],
    content: string,
    client: Client,
    guild?: Guild,
) {
    let finalOptions: CommandInteractionOption[] = [];

    let argsNeeded = 0;

    let currentLevelsGroups: string[] = [];

    const calcNeeded = () => {
        argsNeeded = 0;
        currentLevelsGroups = [];

        for (const opt of options) {
            if (opt.required) argsNeeded++;
            else if (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(opt.type)) {
                argsNeeded++;
                currentLevelsGroups.push(opt.name);
            }
        }
    };
    calcNeeded();

    if (!/^\s+$/.test(content) && options.length >= 1) {
        const grouppath: string[] = [];

        const args = content.split(" ");

        let optIndex: keyof typeof options = 0;

        let currentMode: "stringing" | "resting" | "parsing" = "parsing";
        let currentString: undefined | string;
        let currentName: undefined | string = undefined;

        for (let argIndex = 0; argIndex < args.length; argIndex++) {
            const arg = args[argIndex];

            if (/^\s+$/.test(arg)) continue;

            if (currentName && currentString) {
                if (currentMode === "resting") {
                    if (argIndex + 1 >= args.length) {
                        finalOptions.push({
                            name: currentName,
                            type: "STRING",
                            value: `${currentString} ${arg}`,
                        });
                        currentMode = "parsing";
                        currentString = undefined;
                        currentName = undefined;
                        optIndex++;
                    } else {
                        currentString += ` ${arg}`;
                    }
                } else if (currentMode === "stringing") {
                    if (arg.endsWith('"')) {
                        finalOptions.push({
                            name: currentName,
                            type: "STRING",
                            value: `${currentString} ${arg.replace(/"$/, "")}`,
                        });
                        currentMode = "parsing";
                        currentString = undefined;
                        currentName = undefined;
                        optIndex++;
                    } else {
                        currentString += ` ${arg}`;
                    }
                }
            } else if (
                optIndex <= 0 &&
                currentLevelsGroups.includes(arg.toLowerCase())
            ) {
                grouppath.push(arg.toLowerCase());
                options = (
                    options.find(
                        (o) => o.name === arg.toLowerCase(),
                    ) as ApplicationCommandOption
                ).options as ApplicationCommandOption[];
                calcNeeded();
            } else if (options[optIndex]) {
                const opt = options[optIndex];

                if (/<@!?[0-9]+>/.test(arg) && opt.type === "USER") {
                    const id = arg.replace(/(^<@!?|>$)/g, "");

                    finalOptions.push({
                        name: opt.name,
                        type: "USER",
                        ...(await fetchUser(id, client, guild)),
                    });

                    optIndex++;
                } else if (/<@&!?[0-9]+>/.test(arg) && opt.type === "ROLE") {
                    const id = arg.replace(/(^<@&!?|>$)/g, "");

                    finalOptions.push({
                        name: opt.name,
                        type: "ROLE",
                        ...(await fetchRole(id, guild)),
                    });

                    optIndex++;
                } else if (/<#!?[0-9]+>/.test(arg) && opt.type === "CHANNEL") {
                    const id = arg.replace(/(^<@&!?|>$)/g, "");

                    finalOptions.push({
                        name: opt.name,
                        type: "ROLE",
                        ...(await fetchChannel(id, guild)),
                    });

                    optIndex++;
                } else if (
                    /[0-9]+/.test(arg) &&
                    ["USER", "CHANNEL", "ROLE"].includes(opt.type)
                ) {
                    if (opt.type === "USER") {
                        finalOptions.push({
                            name: opt.name,
                            type: "USER",
                            ...(await fetchUser(arg, client, guild)),
                        });

                        optIndex++;
                    } else if (opt.type === "ROLE") {
                        finalOptions.push({
                            name: opt.name,
                            type: "ROLE",
                            ...(await fetchRole(arg, guild)),
                        });

                        optIndex++;
                    } else if (opt.type == "CHANNEL") {
                        finalOptions.push({
                            name: opt.name,
                            type: "ROLE",
                            ...(await fetchChannel(arg, guild)),
                        });

                        optIndex++;
                    } else {
                        throw `Incorrect value type for ${
                            opt.type
                        }\n\n${optionsToUsage(
                            commandName,
                            options,
                            undefined,
                            grouppath,
                        )}`;
                    }
                } else if (
                    /[0-9]+(\.[0-9]+)?/.test(arg) &&
                    opt.type === "INTEGER"
                ) {
                    finalOptions.push({
                        name: opt.name,
                        type: "INTEGER",
                        value: parseInt(arg),
                    });
                    optIndex++;
                } else if (/^\S+/.test(arg)) {
                    if (opt.type === "STRING") {
                        if (
                            optIndex + 1 >= options.length &&
                            argIndex + 1 < args.length
                        ) {
                            currentMode = "resting";
                            currentString = arg;
                            currentName = opt.name;
                        } else if (arg.startsWith('"')) {
                            currentMode = "stringing";
                            currentString = arg.replace(/^"/, "");
                            currentName = opt.name;
                        } else {
                            if (opt.choices) {
                                const raw = opt.choices.map((c) =>
                                    c.name.toLowerCase(),
                                );
                                if (!raw.includes(arg.toLowerCase()))
                                    throw `${arg.toLowerCase()} does not exist in choices of ${raw.join(
                                        ",",
                                    )}`;
                                else {
                                    const choice = opt.choices.find(
                                        (c) =>
                                            c.name.toLowerCase() ===
                                            arg.toLowerCase(),
                                    ) as ApplicationCommandOptionChoice;

                                    finalOptions.push({
                                        name: opt.name,
                                        type: "STRING",
                                        value: choice.value,
                                    });
                                }
                            } else {
                                finalOptions.push({
                                    name: opt.name,
                                    type: "STRING",
                                    value: arg,
                                });
                            }
                            optIndex++;
                        }
                    } else if (opt.type === "BOOLEAN") {
                        finalOptions.push({
                            name: opt.name,
                            type: "STRING",
                            value:
                                arg.toLowerCase() === "yes" ||
                                arg.toLowerCase() === "true" ||
                                arg.toLowerCase() === "y",
                        });
                        optIndex++;
                    } else {
                        throw `Incorrect value type for ${
                            opt.type
                        }\n\n${optionsToUsage(
                            commandName,
                            options,
                            undefined,
                            grouppath,
                        )}`;
                    }
                } else {
                    throw `Incorrect value type for ${
                        opt.type
                    }\n\n${optionsToUsage(
                        commandName,
                        options,
                        undefined,
                        grouppath,
                    )}`;
                }
            } else {
                throw `Too many arguments\n\n${optionsToUsage(
                    commandName,
                    options,
                    undefined,
                    grouppath,
                )}`;
            }
        }

        if (finalOptions.length < argsNeeded)
            throw `Not enough arguments\n\n${optionsToUsage(
                commandName,
                options,
                undefined,
                grouppath,
            )}`;

        if (grouppath.length > 0) {
            for (
                let groupindex = 0;
                groupindex < grouppath.length;
                groupindex++
            ) {
                finalOptions = [
                    {
                        type:
                            grouppath.length > groupindex + 1
                                ? "SUB_COMMAND_GROUP"
                                : "SUB_COMMAND",
                        name: grouppath[groupindex],
                        options: finalOptions,
                    },
                ];
            }
        }
    }

    if (finalOptions.length < argsNeeded)
        throw `Not enough arguments\n\n${optionsToUsage(
            commandName,
            options,
            undefined,
            [],
        )}`;

    return new CommandInteractionOptionResolver(client, finalOptions);
}

export async function fetchUser(id: Snowflake, client: Client, guild?: Guild) {
    let fetched: GuildMember | undefined = undefined;
    let fetchedUser: User | undefined = undefined;

    if (guild) {
        fetched = await guild.members.fetch(id);
    }

    if (!fetched) {
        fetchedUser = await client.users.fetch(id);
    }

    if (!fetched && !fetchedUser) throw `Could not find member/user ${id}`;

    return {
        member: fetched,
        user: fetched?.user ?? fetchedUser,
    };
}

export async function fetchRole(id: Snowflake, guild?: Guild) {
    if (!guild) throw "Must run in a guild to be able to use a role option";

    const fetched = await guild.roles.fetch(id);
    if (!fetched) throw `Could not find role ${id}`;

    return {
        role: fetched,
    };
}

export async function fetchChannel(id: Snowflake, guild?: Guild) {
    if (!guild) throw "Must run in a guild to be able to use a channel option";

    const fetched = await guild.channels.fetch(id);
    if (!fetched) throw `Could not find channel ${id}`;

    return {
        channel: fetched,
    };
}
