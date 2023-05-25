const oPersistencia = require('../Persistencia/autor_persistencia')

module.exports = {
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
        } else {
            console.log('erro ao cadastrar autor!')
        }
    }
}
