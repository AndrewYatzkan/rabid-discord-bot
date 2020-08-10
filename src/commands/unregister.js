const Discord = require('discord.js');

const { Command } = require("../util/Command.js");
const Log = require("../util/Logger.js");
const db = require("../bot/database.js").database;

function unregister_discord_user(server, discord) {
    const table = db.get_register_table(server.id);
    var lichess_account = null;

    return table.ensure_exists()
    .then(() => table.get_lichess_of(discord))
    .then((res) => {
        if (res.rows.length > 0) {
            lichess_account = res.rows[0].lichess;
            return table.delete_discord(discord);
        }

        unregister.send_response("Not register", `<@${discord}> don't have a lichess account link to it`);
        return Promise.reject();
    })
    .then(() => unregister.send_response(
        "Succesfully unregistered", 
        `<@${discord}> has been succesfully unregistered from [${lichess_account}](https://lichess.org/@/${lichess_account})`))
    .catch((err) => {
        if (err) {
            unregister.send_error("Database Error", `Sorry we couldn't unlink your accounts`);            
            Log.error(1, "Database >>", err);
        }
    });
}

var unregister = new Command(["unregister"])
.set_description("Unlink you from your lichess account")
.set_formats(["unregister", "unregister <discord id>\t\t**[Admin only]**"])
.set_examples(["unregister"])
.on_execution((msg, args) => {
    var id = msg.author.id;

    const server = msg.guild;
    const author = server.members.get(msg.author.id);

    if (args.length > 0) {
        const arg = args[0];
        const is_mention = arg[0] == '<' && arg[1] == '@' && arg[arg.length-1] == '>'; 
        const is_id = !isNaN(arg) || is_mention;

        id = is_mention ? arg.replace(/<|@|!|>/g, "") : arg;

        if (!author.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR))
            return unregister.send_error("Administrator only", "This command can only be executed by administrator");

        if (!is_id)
            return unregister.send_error("Wrong Argument", "This argument must be a discord id or a tag");
    }

    unregister_discord_user(server, id);
})

module.exports = unregister;