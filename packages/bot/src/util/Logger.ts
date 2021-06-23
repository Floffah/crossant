import chalk from "chalk";
import draftlog from "draftlog";

export default class Logger {
    dodebug = false;

    constructor() {
        draftlog(console);
    }

    info(...message: string[]) {
        this.log(Logger.format.info(...message));
    }

    warn(...message: string[]) {
        this.log(Logger.format.warn(...message));
    }

    err(...message: string[] | [boolean, ...string[]]) {
        let trace = false;

        if (typeof message[0] === "boolean") {
            trace = message.shift() as boolean;
        }

        this.log(Logger.format.err(...(message as string[])));
        if (trace) console.trace(message.join(" "));
    }

    debug(...message: string[]) {
        if (this.dodebug) this.log(Logger.format.debug(...message));
    }

    log(...message: string[]) {
        console.log(message.join(" "));
    }

    draft(type: "info" | "warn" | "err", ...message: string[]) {
        const draft = console.draft(Logger.format[type](...message));
        return (newtype: "info" | "warn" | "err", ...newmsg: string[]) =>
            draft(Logger.format[newtype](...newmsg));
    }

    static format = new (class {
        info(...message: string[]) {
            return chalk`{blue.bold !} {green ${message.join(" ")}}`;
        }

        warn(...message: string[]) {
            return chalk`{yellow.bold !} {yellow ${message.join(" ")}}`;
        }

        err(...message: string[]) {
            return chalk`{red.bold !} {red ${message.join(" ")}}`;
        }

        debug(...message: string[]) {
            return chalk`{magenta.bold !} {magenta ${message.join(" ")}}`;
        }
    })();
}
