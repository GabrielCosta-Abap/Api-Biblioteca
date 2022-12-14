const { Console } = require('console')
const oPersistencia = require('../Persistencia/persistencia')

module.exports = {
    autentica_usuario: async function (username, password){
        if (!username || !password) {
            console.log('Usuário e senha são obrigatórios')
        }else{
            if (await oPersistencia._autentica_usuario(username, password)) {
                console.log('Usuário autenticado com sucesso!')
                return true
            }else{
                console.log('Usuário ou senha inválidos!')
            }
        }
    },

    cadastra_livro: async function (isbn, nome, autor_id, editora, ano_publicacao){
        
        if (!isbn || !nome || !autor_id || !editora || !ano_publicacao) {
            throw({code:400, message: 'Todos os campos são obrigatórios'})
        }
        
        if ((await oPersistencia._get_livro(isbn)).length > 0) {
            throw({code:302, message: 'Este livro já está cadastrado'})
        }
        
        if ((await oPersistencia._get_autor(autor_id)).length == 0) {
            throw({code:404, message: 'Autor não encontrado'})
        }
        
        let livro_cadastrado = await oPersistencia._cadastra_livro(isbn, nome, autor_id, editora, ano_publicacao)
        if (livro_cadastrado) {
            console.log('Livro cadastrado com sucesso!')
            console.table(livro_cadastrado)
        }else{
            throw({code: 500, message: 'Deu pau ao cadastrar o livro'})
        }
    },

    cadastra_autor: async function (nome, pais) {
        
        if (!nome || !pais) {
            console.log('é necessário informar nome e país para cadastrar o autor')
            return
        }

        if ((await oPersistencia._get_autor_by_name(nome)).length > 0) {
            console.log('Autor já existe!')
            return
        }

        let autor_cadastrado = await oPersistencia._cadastra_autor(nome, pais)
        
        if (autor_cadastrado.length > 0) {
            console.log('Autor cadastrado com sucesso')
            console.table(autor_cadastrado)
        }else{
            console.log('erro ao cadastrar autor!')
        }
    },

    cadastra_cliente: async function(nome, telefone){
        if ((!nome, !telefone)) {
            console.log('Obrigatório preencher nome e telefone para cadastrar cliente!')
            return
        }

        let cliente_existente = await oPersistencia._get_cliente_by_name(nome)
        if (cliente_existente.length > 0) {
            console.log('Cliente já existe!')
            return
        }

        let cliente_cadastrado = await oPersistencia._cadastra_cliente(nome, telefone)
        if (cliente_cadastrado.length > 0){
            console.log('Cliente cadastrado com sucesso!')
            console.table(cliente_cadastrado)
        }else{
            console.log('Bah meu deu ruim ao cadastrar o cliente!')
        }
    },

    retirada_livro: async (matricula_cliente, id_livro )=>{
        
        console.log('verificando disponibilidade do livro...')
        let livro_disponivel = await oPersistencia._verifica_disponibilidade(id_livro)
        if (livro_disponivel[0].count == 0) {
            // console.log('Livro indisponível! Tente outro dia :/')
            throw({code:400, message: 'Livro indisponível! Tente outro dia :/'})
        }
        
        console.log('verificando limite do cliente...')
        let retorno = await oPersistencia._verifica_limite_cliente(matricula_cliente)
        
        if (retorno > 0) {
            throw({code:400, message: 'Limite de livros atingido. Necessário efetuar devoluções primeiro.'})
        }
        
        console.log('Registrando retirada do livro...')
        retorno = await oPersistencia._registra_retirada(matricula_cliente, id_livro)
        if (retorno.length > 0){
            console.log('Retirada registrada com sucesso!')
        }
        
        console.log('Contabilizando livro na conta do cliente...')
        retorno = await oPersistencia._contabiliza_livro_cliente(matricula_cliente)
        if (retorno.length > 0) {
            console.log('Contabilizado com sucesso!')
        }
        
        console.log('Atualizando status do livro...')
        retorno = await oPersistencia._indisponibiliza_livro(id_livro)
        if (retorno) {
            console.log('Baixa realizada com sucesso!')
        }
        
        console.log('---------------------------------') 
    },

    devolucao_livro: async (matricula_cliente, book_id, retirada_ref)=>{
        
        if (!matricula_cliente, !book_id, !retirada_ref) {
            throw({code: 400, message: 'Todos os campos são obrigatórios!'})
        }

        let cliente = await oPersistencia._get_cliente(matricula_cliente)
        if (cliente.length == 0) {
            throw({code: 404, message: 'Cliente não existe!'})
        }

        let livro = await oPersistencia._get_livro_by_id(book_id)
        if (livro.length == 0) {
            throw({code: 404, message: 'Livro não encontrado!'})
        }
        
        let retirada = await oPersistencia._get_retirada_by_id(retirada_ref)
        if (retirada.length == 0) {
            throw({code: 404, message: 'Não há retirada registrada para este livro!'})
        }

        let devolucao = await oPersistencia._get_devolucao(retirada_ref)
        if (devolucao.length > 0) {
            console.log('Devolução já consta no sistema!')
            throw({code: 302, message: 'Devolução já consta no sistema!'})
        }

        console.log('redisponibilizando livro...')
        await oPersistencia._disponibiliza_livro(book_id)

        let nLivrosRetirados =  parseInt( await oPersistencia._get_livros_retirados(matricula_cliente))
        nLivrosRetirados -= 1

        console.log( 'atualizando conta do cliente...')
        await oPersistencia._reduz_livros_cliente(matricula_cliente, nLivrosRetirados)

        console.log('calculando atraso...')
        let nDiasAtraso = await oPersistencia._get_dias_atraso(retirada_ref)

        if (nDiasAtraso > 0) {
            console.log(`CONSTA ATRASO DE ${nDiasAtraso} DIAS!`)
        }

        console.log('registrando devolução...')
        let retorno = await oPersistencia._registra_devolucao(retirada_ref, oPersistencia._get_current_date(), 2)
        if (retorno.rows.length > 0) {
            console.log('Devolução realizada com sucesso!')

            return nDiasAtraso;

        }else{
            throw({code:500, message:'Erro ao realizar devolução'})
        }
    },

    getLivros: ()=>{
        return oPersistencia._get_livros()
    },

    atualizaLivro: async (livro)=>{
        let livroNew = {}

        try {
            livroNew = await oPersistencia._get_livro_by_id(livro.book_id)
            livroNew = livroNew[0]
        } catch (error) {
            throw({code:404, message:'Livro não encontrado'})
        }

        let bModified = false

        if (livro.isbn) {
            livroNew.isbn = livro.isbn    
            bModified = true
        }
        
        if (livro.nome) {
            livroNew.nome = livro.nome
            bModified = true
        }
        
        if (livro.autor_id) {
            livroNew.autor_id = livro.autor_id
            bModified = true
        }
        
        if (livro.editora) {
            livroNew.editora = livro.editora
            bModified = true
        }
        
        if (livro.ano_publicacao) {
            livroNew.ano_publicacao = livro.ano_publicacao
            bModified = true
        }
        
        if (livro.disponivel || livro.disponivel == ' ') {
            livroNew.disponivel = livro.disponivel
            bModified = true
        }

        if (bModified) {
            console.log('chegou no update')
            let updated = await oPersistencia._atualiza_livro(livroNew)
            
        }else{
            throw({code:400, message: 'Não foram informadas modificações!'})
        }
    },
    
    deletaLivro: async (id)=>{
       await oPersistencia._deleta_livro(id)
    }
}
