const { conexao } = require('./conexao')
const { Client } = require('pg');

module.exports = {
    _get_autor: async function (autor_id) {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = 'SELECT * FROM lib_autores '
        sQuery += `WHERE autor_id    = '${autor_id}'`
        const res = await client.query(sQuery);

        await client.end();
        return res.rows
    },

    _get_autor_by_name: async function (nome) {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = 'SELECT * FROM lib_autores '
        sQuery += `WHERE nome    = '${nome}'`
        const res = await client.query(sQuery);

        await client.end();
        return res.rows
    },

    _cadastra_autor: async (nome, pais) => {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = `INSERT INTO lib_autores `
        sQuery += `(nome, pais_orig)`
        sQuery += ` VALUES('${nome}', '${pais}') RETURNING *`

        const res = await client.query(sQuery);
        await client.end();

        console.log('---------------------------------')
        return res.rows
    }
}