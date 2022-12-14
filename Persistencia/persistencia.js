const { conexao } = require('./conexao')
const { Client, Pool } = require('pg');

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
    },

    _cadastra_livro: async (isbn, nome, autor_id, editora, ano_publicacao)=> {
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = `INSERT INTO lib_livros `
        sQuery += `(isbn, nome, autor_id, editora, ano_publicacao, disponivel)`
        sQuery += ` VALUES('${isbn}', '${nome}', '${autor_id}', '${editora}', '${ano_publicacao}', 'X') RETURNING *`
        const res = await client.query(sQuery);
        console.log('---------------------------------')
        await client.end();  
        // console.table(res.rows)  
        return res.rows
    },

    _get_current_date: function (){
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        
        const formattedToday = dd + '/' + mm + '/' + yyyy;
        return formattedToday
    },

    _calcula_prazo_entrega: function (){
        const today = new Date();
        today.setDate(today.getDate() + 15)

        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        
        const prazo = dd + '/' + mm + '/' + yyyy;
        return prazo
    },

    _registra_retirada: async function(matricula_cliente, id_livro ){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = `INSERT INTO lib_retirada `
            sQuery += `(matricula_cliente, book_id, data_retirada, prazo_entrega)`
            sQuery += ` VALUES('${matricula_cliente}', '${id_livro}', '${this._get_current_date()}', '${this._calcula_prazo_entrega()}') RETURNING *`
        const res = await client.query(sQuery);
        await client.end();
        return res.rows
    },

    _contabiliza_livro_cliente:async function(matricula){
        const pool = new Pool(conexao)
        // const client = new Client(conexao)
        // await pool.connect();
        // await client.connect();

        // let sQuery = `SELECT livros_retirados FROM lib_clientes `
        // sQuery += `WHERE matricula = '${matricula}'`
        // console.log(sQuery)
        // // let res = await client.query(sQuery);
        // let res = await pool.query(sQuery);

        // if (res.rows[0].livros_retirados == null) {
        //     var nLivrosRetirados = 0
        // }else{
        //     var nLivrosRetirados = parseInt(res.rows[0].livros_retirados)
        // }
        
        let nLivrosRetirados = await this._recupera_livros_retirados(matricula)

        nLivrosRetirados += 1
        // await pool.end();
        // await client.end();

        console.log('passou do select')
        await pool.connect();
        // Atualiza quantidade de livros do cliente.
        sQuery = `UPDATE lib_clientes `
        sQuery += `SET livros_retirados = '${nLivrosRetirados}' `
        sQuery += `WHERE matricula = '${matricula}' RETURNING * `
        res = await pool.query(sQuery);

        await pool.end();
        return res.rows 
    },

    _recupera_livros_retirados: async (matricula)=>{
        const client = new Client(conexao)
        let res = {}

        // let sQuery = `SELECT livros_retirados FROM lib_clientes `
        // sQuery += `WHERE matricula = ${matricula}`
        // console.log(sQuery)
        try {
            res = await client.query('SELECT livros_retirados FROM lib_clientes WHERE matricula = $1', [matricula]);
            console.log(res)
        } catch (error) {
            console.log('oie')
            throw({code: 500, message: 'oie'})
        }
        // let res = await client.query(sQuery);
        console.log('chegou aqui 1')
        await client.end();
        
        console.log('chegou aqui 2')
        if (res.rows[0].livros_retirados == null) {
            return 0
        }else{
            return parseInt(res.rows[0].livros_retirados)
        }
    },

    _indisponibiliza_livro: async function (book_id){
        const client = new Client(conexao)
        await client.connect();
        
        sQuery = `UPDATE lib_livros `
        sQuery += `SET disponivel = '' `
        sQuery += `WHERE book_id = '${book_id}' RETURNING * `
        const res = await client.query(sQuery);
        // console.table(res.rows)
        await client.end();    
        if (res.rows.length > 0) {
            return false
        }else{
            return true
        }    
    },

    _verifica_disponibilidade: async function (book_id){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT COUNT(*) FROM lib_livros '
            sQuery += `WHERE book_id    = '${book_id}'`
            sQuery += `  AND disponivel = 'X'`
        const res = await client.query(sQuery);

        await client.end();    
        return res.rows 
    },

    _get_livro: async function (isbn){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_livros '
            sQuery += `WHERE isbn    = '${isbn}'`
        const res = await client.query(sQuery);

        await client.end();    
        return res.rows
    },

    _get_livro_by_id: async function(book_id){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_livros '
        sQuery += `WHERE book_id = ${book_id}`

        console.log(sQuery)
        const res = await client.query(sQuery);

        await client.end();    
        return res.rows
    },

    _get_autor: async function(autor_id){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_autores '
            sQuery += `WHERE autor_id    = '${autor_id}'`
        const res = await client.query(sQuery);

        await client.end();    
        return res.rows
    },

    _get_autor_by_name: async function(nome){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_autores '
            sQuery += `WHERE nome    = '${nome}'`
        const res = await client.query(sQuery);

        await client.end();    
        return res.rows
    },

    _cadastra_autor: async (nome, pais)=>{
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = `INSERT INTO lib_autores `
        sQuery += `(nome, pais_orig)`
        sQuery += ` VALUES('${nome}', '${pais}') RETURNING *`

        const res = await client.query(sQuery);
        await client.end();    
    
        console.log('---------------------------------')
        return res.rows
    },

    _verifica_limite_cliente: async function (matricula){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT COUNT(*) FROM lib_clientes '
            sQuery += `WHERE matricula = '${matricula}'`
            sQuery += `  AND livros_retirados >= 3`
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows[0].count   
    },

    _disponibiliza_livro: async function(book_id){
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `UPDATE lib_livros SET disponivel = 'X' WHERE book_id = ${book_id}`
        const res = await client.query(sQuery);
        await client.end();    
    },
 
    _get_livros_retirados: async function(matricula){
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
    
    _get_data_retirada: async function(retirada_ref){
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `SELECT data_retirada FROM lib_retirada WHERE id_retirada = ${retirada_ref}`
        const res = await client.query(sQuery);
        await client.end();   
        return res.rows[0].data_retirada    
    },

    _registra_devolucao: async function (retirada_ref, data_entrega, dias_atraso) {
        const client = new Client(conexao)
        await client.connect();
        let sQuery = `INSERT INTO lib_devolucao (retirada_ref, data_entrega, dias_atraso) VALUES ('${retirada_ref}', '${data_entrega}', ${dias_atraso}) RETURNING *`
        
        const res = await client.query(sQuery);
        await client.end();   
        return res
    },

    _cadastra_cliente: async (nome, telefone)=>{
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

    _get_cliente_by_name: async function(nome){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_clientes '
            sQuery += `WHERE nome    = '${nome}'`
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows
    },

    _get_cliente: async function(matricula_cliente){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_clientes '
            sQuery += `WHERE matricula = '${matricula_cliente}'`
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows
    }, 

    _get_devolucao: async function(retirada_ref){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_devolucao '
            sQuery += `WHERE retirada_ref = '${retirada_ref}'`
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows
    },

    _get_retirada_by_id: async function(retirada_ref){
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_retirada '
            sQuery += `WHERE id_retirada = '${retirada_ref}'`
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows
    },

    _get_dias_atraso: async function (retirada_ref){
        let data_retirada = await this._get_data_retirada(retirada_ref)
        nDiasAtraso = new Date() - data_retirada
        nDiasAtraso = Math.ceil(nDiasAtraso / (1000 * 3600 * 24))
        
        nDiasAtraso -= 15

        if (nDiasAtraso > 0) {
            return 0
        }else{
            return nDiasAtraso
        }
    },

    _get_livros: async ()=>{
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = 'SELECT * FROM lib_livros'
        const res = await client.query(sQuery);
        await client.end();    
        return res.rows
    },

    _atualiza_livro: async(livro)=>{
        const client = new Client(conexao)
        await client.connect();
        
        console.log(livro.disponivel)

        let sQuery = `UPDATE lib_livros SET isbn           = '${livro.isbn}',`
                                        +   ` nome           = '${livro.nome}',`
                                        +   ` autor_id       = '${livro.autor_id}',`
                                        +   ` editora        = '${livro.editora}',`
                                        +   ` ano_publicacao = '${livro.ano_publicacao}',`
                                        +   ` disponivel     = '${livro.disponivel}'`
                                        + ` WHERE book_id = '${livro.book_id}' RETURNING *`
        const res = await client.query(sQuery);
        await client.end();   
    
        return res;
    },

    _deleta_livro: async (id)=>{
        const client = new Client(conexao)
        const res = {}

        await client.connect();
        
        let sQuery = `DELETE FROM lib_livros WHERE book_id = '${id}' RETURNING *`
        try {
            res = await client.query(sQuery);
        } catch (error) {
            throw({code:404, message: "Este livro não pode ser deletado"})
        }
        await client.end();   
    
        return res;
    }
}