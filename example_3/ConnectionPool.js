const { PgSqlConnect } = require('./PgSqlConnect');

let i = 0;

let globalresult = []

class ConnectionPool extends Array {
    constructor(length){
        super();
        Object.assign(this, Array.apply(null, { length })
            .map(Number.call, Number)
            .map(i => new PgSqlConnect()))
    }
}

module.exports = { ConnectionPool };