const Database = require('better-sqlite3');
const db = new Database('./db/bank.db', { verbose: console.log });
 
// Methods
function getName(clientId){
    var row = db.prepare('SELECT IBAN iban FROM CLIENTS WHERE ID = ?').get(clientId);
    return row.iban;
};


module.exports = {
    getName
}