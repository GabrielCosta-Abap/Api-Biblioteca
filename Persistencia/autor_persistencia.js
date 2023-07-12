const { conexao } = require('./conexao');
const { Client } = require('pg');

module.exports = {
    _get_autores: async ()=>{
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_autores';
        const res = await client.query(sQuery);
        await client.end();
        return res.rows;        
    },

    _get_autor: async function (autor_id) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_autores WHERE autor_id = $1';
        const res = await client.query(sQuery, [autor_id]);

        await client.end();
        return res.rows;
    },

    _get_autor_by_name: async function (nome) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_autores WHERE nome = $1';
        const res = await client.query(sQuery, [nome]);

        await client.end();
        return res.rows;
    },

    _cadastra_autor: async (nome, pais) => {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'INSERT INTO lib_autores (nome, pais_orig) VALUES($1, $2) RETURNING *';
        const res = await client.query(sQuery, [nome, pais]);

        await client.end();

        console.log('---------------------------------');
        return res.rows;
    }
};
