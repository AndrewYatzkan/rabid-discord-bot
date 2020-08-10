const https = require('https');

const { Command } = require("../util/Command.js");
const request = require('../util/request.js');

function request_user_and_status(username, on_data, on_error) {
    return Promise.all([request.status(username), request.user(username)]);
}

var search = new Command(["search", "s"])
.set_description("Search a user in the Lichess's database")
.set_formats(["search <username>", "s <username>"])
.set_examples(["s Hazurl"])
.on_execution((msg, args) => {
    if (args.length < 1)
        return search.send_error("Not enough arguments", "search require a username in parameter");

    request_user_and_status(args[0]).then((req) => {
        const user = req[1];
        const status = req[0][0];
        var desc = `Lichess account : **[${status["name"]}](${user["url"]})**`;
        if (status['online']) {
            if (status['playing'])
                desc += `\n[Playing...](${user['playing']})`;
            else
                desc += `\nOnline`;
        }
        if (user['closed'])
            search.send_error(`Player ${status['name']} found`, 'Closed account');
        else if (user['engine'])
            search.send_warning(`Player ${status['name']} found`, `${desc}\nThis player is flagged for using computer assistance`);
        else
            search.send_response(`Player ${status['name']} found`, desc);
    }).catch((err) => {
        search.send_error("Player not found in lichess's database", "Did you mistype?");
    });
});

module.exports = search;
