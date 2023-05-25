const oNegocioLivro = require('../Negocio/livro_negocio')

module.exports = {

    listarLivros: async (req, res) => {

        try {

            let livro = await oNegocioLivro.getLivros()
            livro ? res.status(200).json(livro) : res.status(404).send('Nenhum livro encontrado')

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    buscarLivroPorId: async (req, res)=>{
        let retorno = await oNegocioLivro.getLivroById(req.params.id);
    
        res.status(200).json(retorno)

    },

    inserirLivro: async (req, res) => {
        const body = req.body

        try {

            await oNegocioLivro.cadastra_livro(body.Isbn, body.Nome, body.AutorId, body.Editora, body.AnoPublicacao);
            res.status(201).json(body)

        } catch (error) {
            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    atualizaLivro: async (req, res) => {
        const id = req.params.id
        const body = req.body
        body.book_id = id
        try {
            await oNegocioLivro.atualizaLivro(body)
            res.status(200).send('Livro atualizado com sucesso!')
        } catch (error) {
            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                console.log(error)
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    deletaLivro: async (req, res) => {
        const id = req.params.id

        try {
            await oNegocioLivro.deletaLivro(id);
            res.status(200).send('Livro eliminado com sucesso!')

        } catch (error) {
            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    devolucaoLivro: async (req, res) => {

        let oDevolucao = req.body;

        try {
            let = nDiasAtraso = await oNegocioLivro.devolucao_livro(oDevolucao.IdLivro, oDevolucao.MatriculaCliente, oDevolucao.RetiradaRef)
            res.status(201).json({ message: 'Devolução registrada com sucesso!', atraso: nDiasAtraso })
        } catch (error) {
            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }

    },

    retiradaLivro: async (req, res) => {
        let body = req.body

        try {
            await oNegocioLivro.retirada_livro(body.MatriculaCliente, body.IdLivro)
            res.status(201).send('Retirada registrada com sucesso!')
        } catch (error) {
            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }

    }

}