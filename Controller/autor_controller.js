const oNegocioAutor = require('../Negocio/autor_negocio')

module.exports = {
    listarAutores: async (req, res) => {
        try {

            let autor = await oNegocioAutor.getAutores()
            autor ? res.status(200).json(autor) : res.status(404).send('Nenhum autor encontrado')

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message)
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    }

}