const { ConnectionPool } = require('./ConnectionPool');

class IGetAwaiter {
    constructor(poolCount) {
        this.pool = new ConnectionPool(poolCount);
    }
    async getAwaiter(collection, result = []){
        if(collection.length > 0){
            console.log(`${this.name} collection.length, ${collection.length}`)
            const promises = [];
            this.pool.forEach((con) => {
                const query = collection.shift();
                if(query) {
                    promises.push(con.query(query));
                }
            });
            const middle = await Promise.all(promises);
            console.log(`${this.name} pool done with, ${promises.length}`)
            result.push(...middle);
            return this.getAwaiter(collection, result);
        } 
        return result;
    }
}

module.exports = { IGetAwaiter }