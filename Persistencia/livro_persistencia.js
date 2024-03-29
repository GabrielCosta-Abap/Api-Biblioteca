const { conexao } = require('./conexao');
const { Client, Pool } = require('pg');

module.exports = {
    _cadastra_livro: async (isbn, nome, autor_id, editora, ano_publicacao) => {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = `INSERT INTO lib_livros `
        sQuery += `(isbn, nome, autor_id, editora, ano_publicacao, disponivel)`
        sQuery += ` VALUES($1, $2, $3, $4, $5, 'X') RETURNING *`
        const res = await client.query(sQuery, [isbn, nome, autor_id, editora, ano_publicacao]);
        console.log('---------------------------------')
        await client.end();
        // console.table(res.rows)  
        return res.rows;
    },

    _get_current_date: function () {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const formattedToday = dd + '/' + mm + '/' + yyyy;
        return formattedToday;
    },

    _calcula_prazo_entrega: function () {
        const today = new Date();
        today.setDate(today.getDate() + 15);

        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const prazo = dd + '/' + mm + '/' + yyyy;
        return prazo;
    },

    _registra_retirada: async function (matricula_cliente, id_livro) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = `INSERT INTO lib_retirada `
        sQuery += `(matricula_cliente, book_id, data_retirada, prazo_entrega)`
        sQuery += ` VALUES($1, $2, $3, $4) RETURNING *`
        const res = await client.query(sQuery, [matricula_cliente, id_livro, this._get_current_date(), this._calcula_prazo_entrega()]);
        await client.end();
        return res.rows;
    },

    _indisponibiliza_livro: async function (book_id) {
        const client = new Client(conexao);
        let sQuery;
        await client.connect();

        sQuery = `UPDATE lib_livros `
        sQuery += `SET disponivel = '' `
        sQuery += `WHERE book_id = $1 RETURNING *`
        const res = await client.query(sQuery, [book_id]);
        await client.end();

        return res.rows.length > 0 ? true : false;
    },

    _verifica_disponibilidade: async function (book_id) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT COUNT(*) FROM lib_livros '
        sQuery += `WHERE book_id = $1 AND disponivel = 'X'`

        const res = await client.query(sQuery, [book_id]);

        await client.end();
        return res.rows;
    },

    _get_livro: async function (isbn) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_livros '
        sQuery += `WHERE isbn = $1`
        const res = await client.query(sQuery, [isbn]);

        await client.end();
        return res.rows;
    },

    _get_livro_by_id: async function (book_id) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_livros WHERE book_id = $1';
        const res = await client.query(sQuery, [book_id]);

        console.log("id:", book_id)
        console.log(res)

        await client.end();
        return res.rows;
    },

    _disponibiliza_livro: async function (book_id) {
        const client = new Client(conexao);
        await client.connect();
        let sQuery = `UPDATE lib_livros SET disponivel = 'X' WHERE book_id = $1`
        const res = await client.query(sQuery, [book_id]);
        await client.end();
    },

    _get_data_retirada: async function (retirada_ref) {
        const client = new Client(conexao);
        await client.connect();
        let sQuery = `SELECT data_retirada FROM lib_retirada WHERE id_retirada = $1`
        const res = await client.query(sQuery, [retirada_ref]);
        await client.end();
        return res.rows[0].data_retirada;
    },

    _registra_devolucao: async function (retirada_ref, data_entrega, dias_atraso) {
        const client = new Client(conexao);
        await client.connect();
        let sQuery = `INSERT INTO lib_devolucao (retirada_ref, data_entrega, dias_atraso) VALUES ($1, $2, $3) RETURNING *`

        const res = await client.query(sQuery, [retirada_ref, data_entrega, dias_atraso]);
        await client.end();
        return res;
    },

    _get_devolucao: async function (retirada_ref) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_devolucao '
        sQuery += `WHERE retirada_ref = $1`
        const res = await client.query(sQuery, [retirada_ref]);
        await client.end();
        return res.rows;
    },

    _get_retirada_by_id: async function (retirada_ref) {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_retirada '
        sQuery += `WHERE id_retirada = $1`
        const res = await client.query(sQuery, [retirada_ref]);
        await client.end();
        return res.rows;
    },

    _get_dias_atraso: async function (retirada_ref) {
        let data_retirada = await this._get_data_retirada(retirada_ref)
        nDiasAtraso = new Date() - data_retirada
        nDiasAtraso = Math.ceil(nDiasAtraso / (1000 * 3600 * 24))

        nDiasAtraso -= 15

        if (nDiasAtraso > 0) {
            return 0;
        } else {
            return nDiasAtraso;
        }
    },

    _get_livros: async () => {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = 'SELECT * FROM lib_livros';
        const res = await client.query(sQuery);
        await client.end();
        return res.rows;
    },

    _atualiza_livro: async (livro) => {
        const client = new Client(conexao);
        await client.connect();

        let sQuery = `UPDATE lib_livros SET nome     = $1,
                                            autor_id = $2, 
                                            editora  = $3, 
                                            ano_publicacao = $4, 
                                            disponivel = $5 
                                            WHERE book_id = $6 RETURNING *`;

        const res = await client.query(sQuery, [livro.nome, livro.autor_id, livro.editora, livro.ano_publicacao, livro.disponivel, livro.book_id]);
        await client.end();

        return res;
    },

    _deleta_livro: async (id) => {
        const client = new Client(conexao);
        let res = {};

        await client.connect();

        let sQuery = `DELETE FROM lib_livros WHERE book_id = $1 RETURNING *`;

        console.log(sQuery);

        try {
            res = await client.query(sQuery, [id]);
        } catch (error) {
            console.log(error);
            throw { code: 404, message: "Este livro não pode ser deletado" };
        }
        await client.end();

        return res;
    },
};
