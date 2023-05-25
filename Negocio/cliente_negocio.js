const oPersistencia = require('../Persistencia/cliente_persistencia')

module.exports = {
    cadastra_cliente: async function (nome, telefone) {
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
        if (cliente_cadastrado.length > 0) {
            console.log('Cliente cadastrado com sucesso!')
            console.table(cliente_cadastrado)
        } else {
            console.log('Bah meu deu ruim ao cadastrar o cliente!')
        }
    }
}