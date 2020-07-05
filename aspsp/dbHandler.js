const Database = require('better-sqlite3');
const db = new Database('./db/bank.db', { verbose: console.log });
 
// Methods
function getName(clientId){
    console.log ("---- Fetching client ----")
    var row = db.prepare('SELECT IBAN iban FROM CLIENTS WHERE ID = ?').get(clientId);
    if(row == null)
        throw new Error("The authenticated user is not a client of the bank");
    return row.iban;
};


module.exports = {
    getName
}