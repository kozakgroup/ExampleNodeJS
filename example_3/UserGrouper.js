const { IGetAwaiter } = require('./IGetAwaiter');

const config = require('./config.json');

const maxFoloversQuery = `SELECT followers
                          FROM users
                          WHERE followers = (SELECT max(followers) FROM users)`

const getTablesByNameQuery = `SELECT * FROM INFORMATION_SCHEMA.TABLES 
                              WHERE TABLE_NAME LIKE '${config.user}%'`

                
function dropTableQuery(name) {
    return `DROP TABLE ${name}`
}


function getQueryCountUsersByGroup({from, to}) {
    return `SELECT COUNT(*), ${from} as from, ${to} as to FROM users WHERE followers BETWEEN ${from} AND ${to}`;
};

function getFillGroupQuery({from, to}, index){
    return `create table alexandr${index} as
            select * from users
            WHERE followers BETWEEN ${from} AND ${to}`;
};

function getTableName({from}) {
    return from / 10000;
}

async function clearTables(){
    const { rows }  = await this.pool[0].query(getTablesByNameQuery);
    return Promise.all(rows.map(({table_name}) => this.pool[0].query(dropTableQuery(table_name))));
}

class UserGrouper extends IGetAwaiter {
    constructor(poolCount){
        super(poolCount);
        this.name = 'users';
    }

    async GroupBy(range) {
        console.log(new Date(), 'Start User Grouping')
        
        try {
            await clearTables.call(this);
            console.log('drop done')

            const { rows } = await this.pool[0].query(maxFoloversQuery);

            const totalGroups = Array.apply(null, { length: rows[0].followers / range })
                .map(Number.call, Number)
                .map(i => ({from: i == 0 ? i : i * range, to: (i + 1) * range - 1}));

            let queryes = totalGroups.map((group) => getQueryCountUsersByGroup(group));

            const resultOfQueryCountUsersByGroup = await this.getAwaiter(queryes);

            const avilavleGroups = resultOfQueryCountUsersByGroup.map(({rows}) => {
                if(Number(rows[0].count) > 0) {
                    return Object.assign(rows[0]);
                } 
            });

            queryes = avilavleGroups.map((group, i) => getFillGroupQuery(group, getTableName(group)));
    
            await this.getAwaiter(queryes);
        } catch(e) {
            console.error(e);
            console.log(new Date(), 'ERROR User Grouping');
        }
        console.log(new Date(), 'Finish User Grouping');
    }
}

module.exports = { UserGrouper };
