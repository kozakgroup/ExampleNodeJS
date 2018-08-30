const { Client } = require('pg');

const config = require('./config.json');

class PgSqlConnect {
    constructor() {
        this.client = new Client(config);
        this.client.connect();
    }
    query(queryString){
        return this.client.query(queryString);
    }
}

module.exports = { PgSqlConnect };
