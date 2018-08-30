const cluster = require('cluster');

const { EmailCollector } = require('./EmailCollector');
const { UserGrouper } = require('./UserGrouper');

if(cluster.isMaster){
    let masterDone = false;
    let clusterDone = false;

    cluster.fork().on('exit', (code) => {
        clusterDone = true
        if(masterDone){
            process.exit(0);
        }
    });

    (async () => {
        const poolCount = 15;
        
        const userGrouper = new UserGrouper(poolCount);
    
        const groupBy = 50000;
    
        await userGrouper.GroupBy(groupBy);
    
        masterDone = true;
    
        if(clusterDone){
            process.exit();
        }
    })()
} else {
    const poolCount = 15;
    const fileToSave = 'emails';
    new EmailCollector(fileToSave, poolCount).collectToFile();
}



