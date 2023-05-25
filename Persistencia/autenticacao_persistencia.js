const { conexao } = require('./conexao')
const { Client } = require('pg');

module.exports = {
    _autentica_usuario: async (username, password) => {
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `SELECT * FROM lib_usuarios WHERE username = '${username}' AND password = '${password}'`;
        const res = await client.query(sQuery);
        await client.end();

        if( res.rows.length > 0 ){
            return true
        }else{
            return false
        }
    }
}