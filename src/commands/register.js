const Discord = require('discord.js');

const { Command } = require("../util/Command.js");
const request = require("../util/request.js");
const Log = require("../util/Logger.js");
const db = require("../bot/database.js").database;

function register_user(command, discord, lichess, table) {
    Log.info(1, `Link ${discord} <-> ${lichess}`);

    Promise.all([
        new Promise((res, rej) => 
            request.user(lichess)
            .then(res)
            .catch((err) => { 
                command.send_error("Player not found in lichess's database", "Did you mistype?");
                rej(); 
            })
        ), new Promise((res, rej) => // Create table -> lichess account unique -> discord user exists
            table.ensure_exists()
            .then(() => table.get_discord_of(lichess))
            .then((discords) => {
                if (discords.rows.length > 0) {
                    var user_linked = discords.rows[0].discord;
                    if (user_linked == discord) 
                        command.send_response("Already registered", `You are already linked to ${lichess}`);
                    else
                        command.send_error("Lichess account already linked", `The user <@${user_linked}> own already this account`);                                
                    return Promise.reject();
                }
                return table.get_lichess_of(discord);
            })
            .then((lichesss) => res(lichesss.rows.length > 0))
            .catch((err) => { 
                if (err) {
                    command.send_error("Database Error", `Sorry we couldn't link your accounts`);            
                    Log.error(1, "Database >>", err);
                }
                rej(err); 
            })
        )
    ])
    .catch((err) => {})
    .then((r) => {
        const update = r[1];
        const lichess_user = r[0];
        const m = () => command.send_response("Succesfully registered", `<@${discord}> have been linked to [${lichess}](${lichess_user['url']})`);
        if(update)
            return table.update_lichess_of(discord, lichess)
            .then(m)
        return table.insert([[discord, lichess]])
        .then(m);
    })
    .catch((err) => {});
}

var register = new Command(["register"])
.set_description("Link your discord account to an lichess account")
.set_formats(["register <lichess username>", "register <discord id> <lichess username>\t\t**[Admin only]**"])
.set_examples(["register Hazurl"])
.on_execution((msg, args) => {
    if (args.length <= 0)
        return register.send_error("Not enough arguments", "register require a username in parameter");

    let discord = msg.author.id;
    let lichess = args[0];
    const server = msg.guild;
    const author = server.members.get(msg.author.id);
    const table = db.get_register_table(server.id);

    if (args.length > 1) {
        const arg = args[0];
        const is_mention = arg[0] == '<' && arg[1] == '@' && arg[arg.length-1] == '>'; 
        const is_id = !isNaN(arg) || is_mention;
    
        discord = is_mention ? arg.replace(/<|@|!|>/g, "") : arg;
        lichess = args[1];

        if (!author.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR))
            return register.send_error("Administrator only", "This command can only be executed by administrator");
    }
    register_user(register, discord, lichess, table);
});

module.exports = register;