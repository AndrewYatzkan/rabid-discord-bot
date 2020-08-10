const { Command } = require("../util/Command.js");

var server_info = new Command(["server-info"])
.set_description("Return server information")
.set_formats(["server-info"])
.set_examples(["server-info"])
.on_execution((msg, args, db, app_info) => {
    return server_info.send_response('Server Info', `Server name: ${msg.guild.name}\nTotal members: ${msg.guild.memberCount}\nServer establsihed: ${msg.guild.createdAt}\nServer Region: ${msg.guild.region}`);
});
//     if (args.length >= 1) {
//         const command = bot.get_command(args[0]);
//         if (command === null)
//             // react with a cross to avoid spamming ?
//             return help.send_error("Unknown command", `The command '${args[0]}' is unknown`);

//         var fields = [];
        
//         if (command.formats.length ) fields.push(['Format' , command.formats.join ('\n')]);
//         if (command.examples.length) fields.push(['Example', command.examples.join('\n')]);
        
//         return help.send_response(`${command.names.join(', ')}`, command.description, fields);
//     }

//     var desc = '**Commands**\n```asciidoc\n';
//     for(var command of bot.unique_commands) {
//         //const command = bot.get_command(command_name);
//         if ('description' in command)
//             desc += `${command.names.join(', ').padEnd(15)}:: ${command.description}\n`
//     }

//     help.send_message(desc + '```');
// });

module.exports = server_info;