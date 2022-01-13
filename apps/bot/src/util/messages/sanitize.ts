export function censorWord(str: string, replacer = "*") {
    const len = str.length - Math.floor(str.length / 2),
        start = Math.floor(len / 2),
        replacement = replacer.repeat(len);
    return str.replace(str.substr(start, len), replacement);
}

export function carefulSplit(str: string, splitter: string) {
    const finalarr: string[] = [];
    let escaping = false,
        currentstr = "";

    for (let i = 0; i < str.length; i++) {
        const chr = str.charAt(i);
        if (chr === "\\") escaping = true;
        else if (escaping) currentstr += chr;
        else if (chr === splitter) {
            finalarr.push(currentstr);
            currentstr = "";
        } else currentstr += chr;
    }
    if (currentstr.length > 0) finalarr.push(currentstr);

    return finalarr;
}
