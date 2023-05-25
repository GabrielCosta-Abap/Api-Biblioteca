const { conexao } = require('./conexao')
const { Client, Pool } = require('pg');

module.exports = {

    _cadastra_cliente: async (nome, telefone) => {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = `INSERT INTO lib_clientes `
        sQuery += `(nome, telefone)`
        sQuery += ` VALUES('${nome}', '${telefone}') RETURNING *`
        const res = await client.query(sQuery);
        await client.end();

        console.log('---------------------------------')
        return res.rows
    },

    _get_cliente_by_name: async function (nome) {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = 'SELECT * FROM lib_clientes '
        sQuery += `WHERE nome    = '${nome}'`
        const res = await client.query(sQuery);
        await client.end();
        return res.rows
    },

    _get_cliente: async function (matricula_cliente) {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = 'SELECT * FROM lib_clientes '
        sQuery += `WHERE matricula = '${matricula_cliente}'`
        const res = await client.query(sQuery);
        await client.end();
        return res.rows
    },

    _verifica_limite_cliente: async function (matricula) {
        const client = new Client(conexao)
        await client.connect();

        let sQuery = 'SELECT COUNT(*) FROM lib_clientes '
        sQuery += `WHERE matricula = '${matricula}'`
        sQuery += `  AND livros_retirados >= 3`

        const res = await client.query(sQuery);
        await client.end();
        return res.rows[0].count
    },

    _get_livros_retirados: async function (matricula) {
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `SELECT livros_retirados FROM lib_clientes WHERE matricula = ${matricula}`
        const res = await client.query(sQuery);
        await client.end();

        return res.rows[0].livros_retirados
    },

    _reduz_livros_cliente: async function (matricula, nLivrosRetirados) {
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `UPDATE lib_clientes SET livros_retirados = ${nLivrosRetirados} WHERE matricula = ${matricula} RETURNING *`

        const res = await client.query(sQuery);

        await client.end();
    },

    _contabiliza_livro_cliente: async function (matricula) {
        const client = new Client(conexao)
        let res, sQuery; 
        let nLivrosRetirados = await this._recupera_livros_retirados(matricula)

        nLivrosRetirados += 1

        await client.connect();
        // Atualiza quantidade de livros do cliente.

        sQuery = `UPDATE lib_clientes `
        sQuery += `SET livros_retirados = '${nLivrosRetirados}' `
        sQuery += `WHERE matricula = '${matricula}' RETURNING * `

        res = await client.query(sQuery);
        
        await client.end();

        return res.rows
    },

    _recupera_livros_retirados: async (matricula) => {
        const client = new Client(conexao)
        await client.connect();
        
        let res = {}

        try {

            var sQuery = 'SELECT livros_retirados FROM lib_clientes WHERE matricula = $1'
            res = await client.query(sQuery, [matricula]);

        } catch (error) {

            throw ({ code: 500, message: 'oie' })

        }
        // let res = await client.query(sQuery);
        // await client.end();

        if (res.rows[0].livros_retirados == null) {
            return 0
        } else {
            return parseInt(res.rows[0].livros_retirados)
        }
    }    

}