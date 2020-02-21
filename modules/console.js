var colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
};

class CustomConsole {
    colors = colors;

    width = process.stdout.columns | 999;
    height = process.stdout.rows | 999;

    time(...args){
        return console.time(...args);
    }
    timeEnd(...args){
        return console.timeEnd(...args);
    }
    outputArray(arr, empty = "None") {
        if(!Array.isArray(arr))throw Error("Cannot convert non-array to array");

        if(!arr.length)return console.log(empty);

        var maxWidth = 0;
        arr.forEach(a => {
            var stripped = a.replace(/\x1b\[[0-9]{1,2}m/gi, "");
            if(stripped.length + 1 > maxWidth)maxWidth = stripped.length + 1;
        });

        var width = Math.floor(maxWidth / this.width);
        var pt = 0;
        var collumn = 0;
        var lines = [];
        arr.forEach(a => {
            var stripped = a.replace(/\x1b\[[0-9]{1,2}m/gi, "");
            if(lines[pt]){
                lines[pt] += " " + a + " ".repeat(maxWidth - stripped.length);
            } else {
                lines[pt] = a + " ".repeat(maxWidth - stripped.length);
            }
            if(collumn > width){
                collumn = 0;
                pt++;
                return;
            }
            collumn++;
        });

        //console.log(lines);
        lines.forEach((a) => console.log(a));
    }
    output(...args) {
        console.log(...args);
    }
    log(...args) {
        console.log(colors.FgGreen + "BPM" + colors.Reset + colors.Bright + " LOG" + colors.Reset, ...args);
    }
    warn(...args) {
        console.log(colors.FgGreen + "BPM" + colors.Reset + colors.Bright + colors.FgYellow + " WARN" + colors.Reset, ...args);
    }
    error(...args) {
        console.log(colors.FgGreen + "BPM" + colors.Reset + colors.Bright + colors.FgRed + " ERROR" + colors.Reset, ...args);
    }
    err(...args) {
        this.error(args);
    }
}

module.exports = CustomConsole;