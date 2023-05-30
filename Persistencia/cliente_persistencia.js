const { conexao } = require('./conexao');
const { Client, Pool } = require('pg');

module.exports = {
    
    _cadastra_cliente: async function (nome, telefone) {
        const client = new Client(conexao);
        await client.connect();
        
        console.log('chegou no insert')
        let sQuery = `INSERT INTO lib_clientes `
        sQuery += `(nome, telefone, livros_retirados)`
        sQuery += ` VALUES($1, $2, 0) RETURNING *`;
        
        const res = await client.query(sQuery, [nome, telefone]);
        await client.end();
        
        console.log('---------------------------------');
        return res.rows;
    },
    
    _listar_clientes: async () => {
        const client = new Client(conexao);
        let res;        

        await client.connect();

        let sQuery = 'SELECT * FROM lib_clientes';

        try {

            res = await client.query(sQuery);
            console.log(res)

        } catch (error) {
            console.log(error)
        }
        await client.end();
        return res.rows;
    },

    _get_cliente_by_name: async function (nome) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_clientes WHERE nome = $1';

        console.log('chegou na query por nome')
        const res = await client.query(sQuery, [nome]);
        await client.end();
        return res.rows;
    },

    _get_cliente: async function (matricula_cliente) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_clientes WHERE matricula = $1';

        const res = await client.query(sQuery, [matricula_cliente]);
        await client.end();
        return res.rows;
    },

    _atualiza_cliente: async (newCliente)=>{

        const client = new Client(conexao);
        await client.connect();

        let sQuery = `UPDATE lib_clientes SET nome             = $1,
                                              telefone         = $2, 
                                              livros_retirados = $3
                                              WHERE matricula = $4 RETURNING *`;

        const res = await client.query(sQuery, [newCliente.nome, newCliente.telefone, newCliente.livros_retirados, newCliente.matricula]);
        await client.end();

        return res.rows;        
    },

    _deleta_cliente: async (matricula) =>{

        const client = new Client(conexao);
        let res = {};

        await client.connect();

        let sQuery = `DELETE FROM lib_clientes WHERE matricula = $1 RETURNING *`;

        try {
            res = await client.query(sQuery, [matricula]);
        } catch (error) {
            console.log(error);
            throw { code: 500, message: error };
        }
        await client.end();
        return res.rows;

    },

    _verifica_limite_cliente: async function (matricula) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT COUNT(*) FROM lib_clientes '
        sQuery += `WHERE matricula = $1 AND livros_retirados >= 3`;

        const res = await client.query(sQuery, [matricula]);
        await client.end();
        return res.rows[0].count;
    },

    _get_livros_retirados: async function (matricula) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = `SELECT livros_retirados FROM lib_clientes WHERE matricula = $1`;
        const res = await client.query(sQuery, [matricula]);
        await client.end();

        return res.rows[0].livros_retirados;
    },

    _reduz_livros_cliente: async function (matricula, nLivrosRetirados) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = `UPDATE lib_clientes SET livros_retirados = $1 WHERE matricula = $2 RETURNING *`;

        const res = await client.query(sQuery, [nLivrosRetirados, matricula]);

        await client.end();
    },

    _contabiliza_livro_cliente: async function (matricula) {
        const client = new Client(conexao);
        let res, sQuery;
        let nLivrosRetirados = await this._recupera_livros_retirados(matricula);

        nLivrosRetirados += 1;

        await client.connect();
        // Atualiza quantidade de livros do cliente.

        sQuery = `UPDATE lib_clientes `
        sQuery += `SET livros_retirados = $1 `
        sQuery += `WHERE matricula = $2 RETURNING * `;

        res = await client.query(sQuery, [nLivrosRetirados, matricula]);

        await client.end();

        return res.rows;
    },

    _recupera_livros_retirados: async function (matricula) {
        const client = new Client(conexao);
        await client.connect();

        let res = {};

        try {

            var sQuery = 'SELECT livros_retirados FROM lib_clientes WHERE matricula = $1';
            res = await client.query(sQuery, [matricula]);

        } catch (error) {

            throw { code: 500, message: 'oie' };

        }

        if (res.rows[0].livros_retirados == null) {
            return 0;
        } else {
            return parseInt(res.rows[0].livros_retirados);
        }
    }
};