const Discord = require('discord.js');
const Command = require('./../util/Command.js').Command;
const Log = require("./../util/Logger.js");
const { dev_mode_enable, major_version, minor_version } = require("../util/Config.js");

class Bot {
    constructor() {
        this.client = new Discord.Client();
        this.commands = {};
        this.unique_commands = [];

        Log.info(0, `Discord >> Connecting to ${dev_mode_enable ? process.env.DISCORD_TOKEN : '***'}`);
        this.client.login(process.env.DISCORD_TOKEN).then((token) => {
            Log.important(0, "Discord >> Successfully connected");
        }).catch((err) => {
            Log.error(0, "Discord >> Connection failed (" + err + ")");
        });
        
        this.client.on('ready', () => {
            Log.important(0, `Discord >> Logged in as ${this.client.user.tag}`);
            this.client.user.setActivity(this.get_prefix() + 'help  |  v' + major_version + '.' + minor_version, { type: 'PLAYING' })
            .then(() => {}).catch((err) => Log.err(0, err));
        });

        this.client.on('message', msg => {
            if (!msg.content.startsWith(this.get_prefix()))
                return;
        
            const contents = msg.content.substr(1).split(' ');
            Log.info(0, `Received: ${contents.join(' ')}`);
        
            if (contents.length >= 1) {
                const command = this.get_command(contents[0]);
        
                if (command !== null) {
                    Log.info(1, "✓ Command found");
                    return command.execute(msg, contents.slice(1), this.db, {});
                }
            }
        
            Log.warning(1, "✘ Command not found");
            msg.channel.send({ embed: {
                color: 0xff0000,
                title: "Unknown command",
                description: `type ${this.get_prefix()}help`
            }});
        
        });
    }

    get_client() {
        return this.client;
    }

    get_prefix() {
        return '%';
    }

    add_command(c) {
        let b = c instanceof Command;
        if (b) {
            if (!c.hidden) {
                this.unique_commands.push(c);
                for(var n of c.names) {
                    this.commands[n] = c;
                }
                return true;
            }
        }
        else {
            Log.warning(0, "Trying to add command: ", typeof c, JSON.stringify(c));
        }

        return false;
    }

    get_command(name) {
        return this.commands[name] || null;
    }

}

module.exports.bot = new Bot();