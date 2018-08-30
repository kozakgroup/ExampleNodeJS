const fs = require('fs');
const stringify = require('csv-stringify');

const { IGetAwaiter } = require('./IGetAwaiter');

function writeCSV(filename, data) {
    return new Promise((resolve, reject) => {
        stringify(data, {header: true}, (err, output) => {
            if (err) {
              throw err
            }
            fs.writeFileSync(filename, output)
            resolve();
            console.log('DONE: Wrote', filename)
          });
    });
}

const totalUsersQuery = 'SELECT COUNT(*) FROM users'

class EmailCollector extends IGetAwaiter {
    constructor(fileToSave, poolCount){
        super(poolCount);
        this.name = 'email';
        this.fileToSave = fileToSave;
        if (fs.existsSync(`./${this.fileToSave}.csv`)) {
            fs.unlinkSync(`./${this.fileToSave}.csv`);
        }
    }

    async collectToFile(){
        console.log(new Date(), 'Start Collect Emails')
        try {
            const { rows } = await this.pool[0].query(totalUsersQuery);

            const length = Math.floor(rows[0].count / this.pool.length / 1000);
            // const length = 150;

            let queryes = Array.apply(null, { length })
                .map(Number.call, Number)
                .map(i => {
                    if(i != 0 && length - 1 != i){
                        return `SELECT regexp_substr(bio, '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+') as email
                            FROM (SELECT bio FROM users WHERE bio is NOT NULL LIMIT ${length} OFFSET ${length * i}) as bio
                            WHERE bio IS NOT NULL AND bio ~ '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+'`
                    } else if(i == 0){
                        return `SELECT regexp_substr(bio, '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+') as email
                                FROM (SELECT bio FROM users WHERE bio is NOT NULL LIMIT ${length}) as bio
                                WHERE bio IS NOT NULL AND bio ~ '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+'`
                    } else if (length - 1 == i) {
                        return `SELECT regexp_substr(bio, '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+') as email
                            FROM (SELECT bio FROM users WHERE bio is NOT NULL OFFSET ${length * i}) as bio
                            WHERE bio IS NOT NULL AND bio ~ '[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+'`
                    }
                });


            const result = await this.getAwaiter(queryes);

            const emails = [];
            result.forEach(({rows}) => {
                emails.push(...rows.map(({email}) => ({email})));
            })
            await writeCSV(`./${this.fileToSave}.csv`, emails);
        } catch (e) {
            console.error(e);
            console.log(new Date(), 'ERROR Collect Emails')
        } finally {
            console.log(new Date(), 'End Collect Emails');
            process.exit(0);
        }
    }
}

module.exports =  { EmailCollector };
