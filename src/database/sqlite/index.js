const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

/* 
O processo de conexão com o banco de dados leva em consideração alguns fatores ao iniciar, como;
-> Já existe esse arquivo? 
    * Se sim, ele é iniciado. 
    * Senão, o arquivo é criado. (O que é o caso quando ele é iniciado a primeira vez)
Por não acontecer no mesmo momento é necessário usar uma função assíncrona.
*/
async function sqliteConnection() {
    const database = await sqlite.open({
        filename: path.resolve(__dirname, "..", "database.db"),
        driver: sqlite3.Database
    });

    return database;
};

module.exports = sqliteConnection;