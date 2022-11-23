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
            console.log('Todos os campos são obrigatórios')
            return
        }
        
        if ((await oPersistencia._get_livro(isbn)).length > 0) {
            console.log('Este livro já está cadastrado')
            return
        }
        
        if ((await oPersistencia._get_autor(autor_id)).length == 0) {
            console.log('Autor não encontrado')
            return
        }
        
        let livro_cadastrado = await oPersistencia._cadastra_livro(isbn, nome, autor_id, editora, ano_publicacao)
        if (livro_cadastrado) {
            console.log('Livro cadastrado com sucesso!')
            console.table(livro_cadastrado)
        }else{
            console.log('Deu pau ao cadastrar o livro')
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
        if (livro_disponivel.length == 0) {
            console.log('Livro indisponível! Tente outro dia :/')
            return
        }
        
        console.log('verificando limite do cliente...')
        let retorno = await oPersistencia._verifica_limite_cliente(matricula_cliente)
       
        console.log(retorno)
        console.log(retorno > 0)
        if (retorno > 0) {
            console.log('Limite de livros atingido. Necessário efetuar devoluções primeiro.')
            return
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
    }
}