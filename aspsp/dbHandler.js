const Database = require('better-sqlite3');
const db = new Database('./db/bank.db', { verbose: console.log });
 
// Methods
function getName(clientId){
    console.log ("---- Fetching client ----");
    var row = db.prepare('SELECT IBAN iban FROM CLIENTS WHERE ID = ?').get(clientId);
    if(row == null)
        throw new Error("The authenticated user is not a client of the bank");
    return row.iban;
};

function createClient(clientId, clientIban) {
    console.log("---- Creating new client----");
    var statement = db.prepare('INSERT INTO clients (ID, IBAN) VALUES(@clientId, @clientIban)');
    statement.run({
        clientId: clientId,
        clientIban: clientIban
      });
};

function deleteClient(clientId) {
    console.log("---- Deleting a client----");
    var statement = db.prepare('DELETE FROM clients WHERE ID = @clientId');
    statement.run({
        clientId: clientId
      });   
};




module.exports = {
    getName,
    createClient,
    deleteClient
}