const oPersistenciaLivro = require('../Persistencia/livro_persistencia')
const oPersistenciaAutor = require('../Persistencia/autor_persistencia')
const oPersistenciaCliente = require('../Persistencia/cliente_persistencia')

module.exports = {
    cadastra_livro: async function (isbn, nome, autor_id, editora, ano_publicacao) {
        console.log({
            isbn: isbn,
            nome: nome,
            autor_id: autor_id,
            editora: editora,
            ano_publicacao: ano_publicacao,

        })
        if (!isbn || !nome || !autor_id || !editora || !ano_publicacao) {
            throw ({ code: 400, message: 'Todos os campos são obrigatórios' })
        }

        if ((await oPersistenciaLivro._get_livro(isbn)).length > 0) {
            throw ({ code: 302, message: 'Este livro já está cadastrado' })
        }

        if ((await oPersistenciaAutor._get_autor(autor_id)).length == 0) {
            throw ({ code: 404, message: 'Autor não encontrado' })
        }

        let livro_cadastrado = await oPersistenciaLivro._cadastra_livro(isbn, nome, autor_id, editora, ano_publicacao)
        if (livro_cadastrado) {
            console.log('Livro cadastrado com sucesso!')
            console.table(livro_cadastrado)
        } else {
            throw ({ code: 500, message: 'Deu pau ao cadastrar o livro' })
        }
    },

    retirada_livro: async (matricula_cliente, id_livro) => {

        console.log('verificando disponibilidade do livro...')
        let livro_disponivel = await oPersistenciaLivro._verifica_disponibilidade(id_livro)
        if (livro_disponivel[0].count == 0) {
            // console.log('Livro indisponível! Tente outro dia :/')
            throw ({ code: 400, message: 'Livro indisponível! Tente outro dia :/' })
        }

        console.log('verificando limite do cliente...')
        let retorno = await oPersistenciaCliente._verifica_limite_cliente(matricula_cliente)

        if (retorno > 0) {
            throw ({ code: 400, message: 'Limite de livros atingido. Necessário efetuar devoluções primeiro.' })
        }

        console.log('Registrando retirada do livro...')
        retorno = await oPersistenciaLivro._registra_retirada(matricula_cliente, id_livro)
        if (retorno.length > 0) {
            console.log('Retirada registrada com sucesso!')
        }

        console.log('Contabilizando livro na conta do cliente...')
        retorno = await oPersistenciaCliente._contabiliza_livro_cliente(matricula_cliente)
        if (retorno.length > 0) {
            console.log('Contabilizado com sucesso!')
        }

        console.log('Atualizando status do livro...')
        retorno = await oPersistenciaLivro._indisponibiliza_livro(id_livro)
        if (retorno) {
            console.log('Baixa realizada com sucesso!')
        }

        console.log('---------------------------------')
    },

    devolucao_livro: async (book_id, matricula_cliente, retirada_ref) => {

        if (!matricula_cliente, !book_id, !retirada_ref) {
            throw ({ code: 400, message: 'Todos os campos são obrigatórios!' })
        }

        let cliente = await oPersistenciaCliente._get_cliente(matricula_cliente)
        if (cliente.length == 0) {
            throw ({ code: 404, message: 'Cliente não existe!' })
        }

        let livro = await oPersistenciaLivro._get_livro_by_id(book_id)
        if (livro.length == 0) {
            throw ({ code: 404, message: 'Livro não encontrado!' })
        }

        let retirada = await oPersistenciaLivro._get_retirada_by_id(retirada_ref)
        if (retirada.length == 0) {
            throw ({ code: 404, message: 'Não há retirada registrada para este livro!' })
        }

        let devolucao = await oPersistenciaLivro._get_devolucao(retirada_ref)
        if (devolucao.length > 0) {
            console.log('Devolução já consta no sistema!')
            throw ({ code: 302, message: 'Devolução já consta no sistema!' })
        }

        console.log('redisponibilizando livro...')
        await oPersistenciaLivro._disponibiliza_livro(book_id)

        let nLivrosRetirados = parseInt(await oPersistenciaCliente._get_livros_retirados(matricula_cliente))
        nLivrosRetirados -= 1

        console.log('atualizando conta do cliente...')
        await oPersistenciaCliente._reduz_livros_cliente(matricula_cliente, nLivrosRetirados)

        console.log('calculando atraso...')
        let nDiasAtraso = await oPersistenciaLivro._get_dias_atraso(retirada_ref)

        if (nDiasAtraso > 0) {
            console.log(`CONSTA ATRASO DE ${nDiasAtraso} DIAS!`)
        }

        console.log('registrando devolução...')
        let retorno = await oPersistenciaLivro._registra_devolucao(retirada_ref, oPersistenciaLivro._get_current_date(), 2)
        if (retorno.rows.length > 0) {
            console.log('Devolução realizada com sucesso!')

            return nDiasAtraso;

        } else {
            throw ({ code: 500, message: 'Erro ao realizar devolução' })
        }
    },

    getLivros: () => {
        return oPersistenciaLivro._get_livros()
    },

    getLivroById: async (id) => {
        return await oPersistenciaLivro._get_livro_by_id(id);
    },

    atualizaLivro: async (livro) => {
        let livroNew = {}

        try {
            livroNew = await oPersistenciaLivro._get_livro_by_id(livro.book_id)
            livroNew = livroNew[0]
        } catch (error) {
            throw ({ code: 404, message: 'Livro não encontrado' })
        }

        let bModified = false

        console.log(livroNew)

        if (livro.Nome) {
            livroNew.nome = livro.Nome
            bModified = true
        }

        if (livro.AutorId) {
            livroNew.autor_id = livro.AutorId
            bModified = true
        }

        console.log(livro.Editora)
        if (livro.Editora) {
            console.log('eentrou na editora')
            livroNew.editora = livro.Editora
            bModified = true
        }

        if (livro.AnoPublicacao) {
            livroNew.ano_publicacao = livro.AnoPublicacao
            bModified = true
        }

        if (livro.Disponivel || livro.Disponivel == ' ') {
            livroNew.disponivel = livro.Disponivel
            bModified = true
        }

        if (bModified) {
            console.log('chegou no update')
            let updated = await oPersistenciaLivro._atualiza_livro(livroNew)
            return updated;
        } else {
            throw ({ code: 400, message: 'Não foram informadas modificações!' })
        }
    },

    deletaLivro: async (id) => {
        await oPersistenciaLivro._deleta_livro(id)
    }
}