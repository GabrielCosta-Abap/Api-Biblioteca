const { Client, Pool } = require('pg')
const { conexao } = require('./conexao')
const persistencia = require('./persistencia.js')
const { _get_current_date } = require('./persistencia.js')

module.exports = {
    autentica_usuario: async (username, password) => {
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

    cadastra_livro: async (isbn, nome, autor_id, editora, ano_publicacao)=> {
        const client = new Client(conexao)
        await client.connect();
        
        let sQuery = `INSERT INTO lib_livros `
        sQuery += `(isbn, nome, autor_id, editora, ano_publicacao, disponivel)`
        sQuery += ` VALUES('${isbn}', '${nome}', '${autor_id}', '${editora}', '${ano_publicacao}', 'X') RETURNING *`
        const res = await client.query(sQuery);
        console.log('---------------------------------')
        await client.end();    
        return res.rows
    },

    cadastra_autor: async (nome, pais)=>{
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

    cadastra_cliente: async (nome, telefone)=>{
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

    retirada_livro: async (matricula_cliente, id_livro )=>{
        const client = new Client(conexao)
        await client.connect();
        
        console.log('verificando disponibilidade do livro...')
        let retorno = await persistencia._verifica_disponibilidade(id_livro)
        
        console.log('verificando limite do cliente...')
        retorno = await persistencia._verifica_limite_cliente(matricula_cliente)
        
        console.log('Registrando retirada do livro...')
        retorno = await persistencia._registra_retirada(matricula_cliente, id_livro)
        
        console.log('Contabilizando livro na conta do cliente...')
        retorno = await persistencia._contabiliza_livro_cliente(matricula_cliente)
        
        console.log('Atualizando status do livro...')
        retorno = await persistencia._indisponibiliza_livro(id_livro)

        console.log('---------------------------------') 
    },

    devolucao_livro: async (matricula_cliente, book_id, retirada_ref)=>{
        
        // persistencia._disponibiliza_livro(book_id)

        // let nLivrosRetirados =  parseInt( await persistencia._get_livros_retirados(matricula_cliente))
        // nLivrosRetirados -= 1

        // persistencia._reduz_livros_cliente(matricula_cliente, nLivrosRetirados)

        // console.log(this._get_dias_atraso(retirada_ref))

        persistencia._registra_devolucao(retirada_ref, persistencia._get_current_date(), 2)

    }


    // _get_dias_atraso: async function(retirada_ref){
    //     let data_retirada = await persistencia._get_data_retirada(retirada_ref)
    //     nDiasAtraso = new Date() - data_retirada
    //     return Math.ceil(nDiasAtraso / (1000 * 3600 * 24))
    // }
}



