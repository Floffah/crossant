import chalk from "chalk";

export default class Logger {
    prefix?: string;
    debugEnabled?: boolean;

    fmtPrefix() {
        return this.prefix || this.prefix === "" ? `(${this.prefix})` : "";
    }

    info(...messages: string[]) {
        this.log(chalk`{green info}${this.fmtPrefix()}`, ...messages);
    }

    debug(...messages: string[]) {
        if (this.debugEnabled)
            this.log(chalk`{blue debug}${this.fmtPrefix()}`, ...messages);
    }

    warn(...messages: string[]) {
        this.log(chalk`{yellow warn}${this.fmtPrefix()}`, ...messages);
    }

    err(...messages: string[]) {
        this.log(chalk`{red err}${this.fmtPrefix()}`, ...messages);
    }

    log(...messages: string[]) {
        console.log(messages.join(" "));
    }
}
