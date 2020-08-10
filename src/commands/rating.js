const https = require('https');

const { Command } = require("../util/Command.js");
const request = require('../util/request.js');

const categories_classical = [
    ["Bullet", "bullet"],
    ["Classical", "classical"],
    ["Blitz", "blitz"],
    ["Rapid", "rapid"],
    ["Ultra bullet", "ultraBullet"],
    ["Correspondence", "correspondence"]
];

const categories_variants = [
    ["King of the hill", "kingOfTheHill"],
    ["Puzzle", "puzzle"],
    ["Crazy House", "crazyhouse"],
    ["Chess 960", "chess960"],
    ["Atomic", "atomic"],
    ["Racing king", "racingKings"],
    ["Horde", "horde"],
    ["Three check", "threeCheck"]
];

function get_rating(perfs, category) {
    const infos = perfs[category[1]];
    if (typeof infos == "undefined")
        return "Unranked";
    return infos['rating'] + ((typeof infos['prov'] == "undefined") ? '' : '?');
}

var rating = new Command(["rating", "r"])
.set_description("Search rating of a user in the Lichess's database")
.set_formats(["rating <username>", "r <username>"])
.set_examples(["r Hazurl"])
.on_execution((msg, args) => {
    if (args.length < 1)
        return rating.send_error("Not enough arguments", "rating require a username in parameter");

    request.user(args[0]).then((user) => {
        var fclassical = [];
        var fvariant = [];

        for(var category of categories_classical)
            fclassical.push([category[0], get_rating(user['perfs'], category), true]);

        for(var category of categories_variants)
            fvariant.push([category[0], get_rating(user['perfs'], category), true]);

        rating.send_response(`${user['username']}'s rating on classical`, '', fclassical);
        rating.send_response(`${user['username']}'s rating on variants`, '', fvariant);
    }).catch((err) => {
        return rating.send_error("Player not found in lichess's database", "Did you mistype?");
    });
});

module.exports = rating;