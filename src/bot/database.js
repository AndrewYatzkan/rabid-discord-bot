const Client = require('pg').Client;

const Log = require("./../util/Logger.js");
const bot = require("./bot.js").bot;
const { dev_mode_enable } = require("../util/Config.js");

class ServersTable {
    constructor(db) {
        this.name = "servers";
        this.db = db;
    }

    ensure_exists() {
        return this.db.ensure_table_exists(this.name, [
            "server_id BIGINT UNIQUE",
            "role_info TEXT",
            "PRIMARY KEY(server_id)",
            "UNIQUE(server_id)"
        ]);
    }

    ensure_key_exists(keyname, value) {
        return new Promise((res, rej) => {
            return this.db.do_query(`INSERT INTO ${this.name} (${keyname}) VALUES ($1);`, [value])
            .then((r) => {
                Log.important(1, "Database >> Create key " + keyname);
                res(r);
            })
            .catch((err) => {
                if (err.code != "23505") { // remove error if already created
                    Log.error(1, "Database >>", err);
                    return rej(err);
                }
                return res();
            });
        });
    }

    get_role_info(server_id) {
        return this.db.do_query(`SELECT role_info FROM servers WHERE server_id = $1;`, [server_id])
    }

    remove_role(server_id, id) {
        return this.get_role_info(server_id).then((res) => {
            var roles = JSON.parse(res.rows[0].role_info);
            var change = false;
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].role_id === id) {
                    roles.splice(i, i+1);
                    change = true;
                }
            }
            if (change) {
                return this.update_role_info(server_id, roles).then(() => {
                    Log.important(1, `Database >> Removed role (${id}) from server (${server_id})`);
                    return true;
                }).catch(() => {
                    Log.error(1, `Database >> Could not remove role (${id}) from server (${server_id}) (1)`);
                    return false;
                });
            }
            return false;
        }).catch(() => {
            Log.error(1, `Database >> Could not remove role (${id}) from server (${server_id}) (2)`);
            return false;
        });
    }

    update_role_info(server_id, role_info) {
        return this.db.do_query(`UPDATE ${this.name} SET role_info=$1::text WHERE server_id=$2;`, [JSON.stringify(role_info), server_id]);
    }
}

class RegisterTable {
    constructor(name, db) {
        this.name = name;
        this.db = db;
    }

    ensure_exists() {
        return this.db.ensure_table_exists(this.name, [
            "discord BIGSERIAL UNIQUE", 
            "lichess VARCHAR(50) UNIQUE", 
            "PRIMARY KEY(discord, lichess)", 
            "UNIQUE(discord, lichess)"
        ]);
    }

    get_discord_of(lichess) {
        return this.db.do_query(
            `SELECT discord FROM ${this.name} WHERE lichess=$1::text;`,
            [lichess]
        );
    }

    get_lichess_of(discord) {
        return this.db.do_query(
            `SELECT lichess FROM ${this.name} WHERE discord=$1;`,
            [discord]
        );
    }

    update_discord_of(lichess, discord) {
        return this.db.do_query(
            `UPDATE ${this.name} SET discord=$1 WHERE lichess=$2::text;`,
            [discord, lichess]
        );
    } 

    update_lichess_of(discord, lichess) {
        return this.db.do_query(
            `UPDATE ${this.name} SET lichess=$1::text WHERE discord=$2;`,
            [lichess, discord]
        );
    } 

    delete_discord(discord) {
        return this.db.do_query(
            `DELETE FROM ${this.name} WHERE discord=$1;`,
            [discord]
        );
    }

    delete_lichess(lichess) {
        return this.db.do_query(
            `DELETE FROM ${this.name} WHERE lichess=$1::text;`,
            [lichess]
        );
    }

    insert(pair_discord_lichess) {
        let q = `INSERT INTO ${this.name} VALUES `;
        for(var i = 0; i < pair_discord_lichess.length; ++i) {
            if (i > 0)
                q += ', ';
            q += `($${i*2+1}, $${i*2+2}::text)`;
        }
        return this.db.do_query(
            q + ';',
            pair_discord_lichess.reduce((acc, val) => acc.concat(val), [])
        );
    }
}

class Database {
    constructor() {
        const connectionString = process.env.CHESS_BOT_DB;
        Log.info(0, `Database >> Connecting to ${dev_mode_enable ? connectionString : '***'}`);
        // this.client = new Client({ connectionString });
        this.client = new Client();
        this.client.connect()
            .then (()    => Log.important(0, "Database >> Successfully connected"))
            .catch((err) => Log.error(0, "Database >> Connection failed (", err, ")"));
    }

    get_client() {
        return this.client;
    }

    do_query(query, values) {
        Log.detail(2, "Database >> " + query, JSON.stringify(values) );
        return this.client.query(query, values);
    }

    get_register_table(server_id) {
        return new RegisterTable(`register_${server_id}`, this);
    }

    get_servers_table(server_id) {
        return new ServersTable(this);
    }

    ensure_table_exists(table, variables) {
        return new Promise((res, rej) => {
            return this.do_query(`CREATE TABLE ${table} ( ${variables.join(', ')} );`)
            .then((r) => {
                Log.important(1, "Database >> Create table " + table);
                res(r);
            })
            .catch((err) => {
                if (err.code != "42P07") { // remove error if already created
                    Log.error(1, "Database >>", err);
                    return rej(err);
                }
                return res();
            });
        });
    }

}

module.exports.database = new Database();