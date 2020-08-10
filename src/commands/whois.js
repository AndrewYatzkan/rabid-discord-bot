const { Command } = require("../util/Command.js");
const Log = require("../util/Logger.js");
const db = require("../bot/database.js").database;

var whois = new Command(["whois", "w"])
.set_description("Search the discord/lichess account link to it")
.set_formats(["whois <discord id>", "whois <discord tag>", "whois <lichess name>"])
.set_examples(["whois Hazurl\t(Search discord account linked to the lichess account 'Hazurl')", "whois @Hazurl\t(Search lichess account linked to 'Hazurl')"])
.on_execution((msg, args) => {
    if (args.length <= 0) {
        return whois.send_error("Not enough arguments", "whois require a username in parameter");
    }
    
    const server = msg.guild;
    const table = db.get_register_table(server.id);

    const arg = args[0];
    const is_mention = arg[0] == '<' && arg[1] == '@' && arg[arg.length-1] == '>'; 
    const is_id = !isNaN(arg) || is_mention;

    const id = is_mention ? arg.replace(/<|@|!|>/g, "") : arg;

    if (is_id) {
        const username = server.members.get(id).user.username;
        return table.ensure_exists()
        .then(() => table.get_lichess_of(id))
        .then((res) => {
            if (res.rows.length > 0) {
                const lichess_account = res.rows[0].lichess;
                whois.send_response(`Who is ${username}`, `<@${id}> is linked to [${lichess_account}](https://lichess.org/@/${lichess_account})`)
                return lichess_account;
            }

            return whois.send_error(`${username} not found`, `Sorry <@${id}> has no lichess account register`);
        })
        .catch((err) => {
            whois.send_error("Database Error", `An internal error occurs`);            
            Log.error(1, "Database >>", err);
        });
    }

    const lichess_name = arg;

    return table.ensure_exists()
    .then(() => table.get_discord_of(id))
    .then((res) => {
        if (res.rows.length > 0) {
            const discord_user = res.rows[0].discord;
            return whois.send_response(`Who is ${lichess_name}`, `[${lichess_name}](https://lichess.org/@/${lichess_name}) is linked to <@${discord_user}>`)
        }

        return whois.send_error(`${lichess_name} not found`, `Sorry ${lichess_name} has no discord account link to`);
    })
    .catch((err) => {
        whois.send_error("Database Error", `An internal error occurs`);            
        Log.error(1, "Database >>", err);
    });


})

module.exports = whois;