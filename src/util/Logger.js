const cli = require("cli-color");
const { console_color_enable } = require("../util/Config.js");

function if_color_enable(f) {
    return console_color_enable ? f : (t) => t;
}

function formatted_time() {
    const t = new Date();
    const h = t.getHours().toString().padStart(2, '0');
    const m = t.getMinutes().toString().padStart(2, '0');
    const s = t.getSeconds().toString().padStart(2, '0');
    return if_color_enable(cli.blackBright)(`[${h}:${m}:${s}]`);
}

function prefix(indent) {
    return formatted_time() + '    '.repeat(indent);
}

function make_logger(l) {
    return function(n) {
        if (typeof n != "number")
            console.log("You forget the prefix, noob");
        console.log(prefix(n) + ' ' + l.apply(this, Array.from(arguments).slice(1)));
    };
}

module.exports = {
    detail :    make_logger(if_color_enable(cli.white)),
    info :      make_logger(if_color_enable(cli.green)),
    important : make_logger(if_color_enable(cli.bold.blue)),
    warning :   make_logger(if_color_enable(cli.bold.yellowBright)),
    error :     make_logger(if_color_enable(cli.bold.red)),
};