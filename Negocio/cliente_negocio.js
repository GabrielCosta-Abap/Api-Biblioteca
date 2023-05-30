const oPersistencia = require('../Persistencia/cliente_persistencia')

module.exports = {
    cadastra_cliente: async function (nome, telefone) {
        if ((!nome, !telefone)) {
            throw 'Obrigatório preencher nome e telefone para cadastrar cliente!';
        }

        let cliente_existente = await oPersistencia._get_cliente_by_name(nome)
        if (cliente_existente.length > 0) {
            throw 'Cliente já existe!';
        }

        console.log('passou da query por nome')
        let cliente_cadastrado = await oPersistencia._cadastra_cliente(nome, telefone)
        if (cliente_cadastrado.length > 0) {
            console.log('Cliente cadastrado com sucesso!')
            console.table(cliente_cadastrado)
        } else {
            console.log('Bah meu deu ruim ao cadastrar o cliente!')
        }
    },

    listar_clientes: async ()=>{
        return await oPersistencia._listar_clientes();
    },
    
    buscar_cliente_por_id: async (matricula)=>{
        return await oPersistencia._get_cliente(matricula);
    },
    
    atualiza_cliente: async (newCliente)=>{
        return await oPersistencia._atualiza_cliente(newCliente);
    },

    deleta_cliente: async (matricula)=>{
        return await oPersistencia._deleta_cliente(matricula);
    }
}