const https = require('https');
const Log = require("./Logger.js");

module.exports = {
    request: (link) => {
        Log.important(2, `Lichess >> ${link}`);
        return new Promise((res, rep) => {
            https.get(link, resp => {
                if (resp.statusCode != 200) {
                    return rep({ status_code: resp.statusCode });
                }
                var data = '';
                resp.on('data', chunk => data += chunk )
                return resp.on('end', () => res(JSON.parse(data)) );
            }).on('error', err => {
                return rep(err);
            });
        });
    },

    lichess: (api) => {
        return module.exports.request(`https://lichess.org/api/${api}`);
    },

    user: (username) => {
        Log.detail(2, `Lichess >> User ${username}`);
        return module.exports.lichess(`user/${username}`);
    },

    status: (username) => {
        Log.detail(2, `Lichess >> Status of ${username}`);
        return module.exports.lichess(`users/status?ids=${username}`);
    }
};