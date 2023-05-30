const oNegocioCliente = require('../Negocio/cliente_negocio')

module.exports = {
    inserirCliente: async (req, res) => {
        const body = req.body;

        try {

            await oNegocioCliente.cadastra_cliente(body.Nome, body.Telefone);
            res.status(201).json(body)

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }

        }
    },

    listarClientes: async (req, res) => {

        try {

            const clientes = await oNegocioCliente.listar_clientes();
            res.status(200).json(clientes)

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }

        }
    },

    buscarClientePorId: async (req, res)=>{
        const matricula = req.params.matricula

        try {
            
            const cliente = await oNegocioCliente.buscar_cliente_por_id(matricula);
            res.status(200).json(cliente)

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    atualizaCliente: async (req, res)=>{
        const newCliente = req.body
        newCliente.matricula = req.params.matricula; 

        try {
            
            const cliente = await oNegocioCliente.atualiza_cliente(newCliente);
            res.status(200).json(cliente)

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    },

    deletaCliente: async (req, res)=>{
        matricula = req.params.matricula; 

        try {
            
            const cliente = await oNegocioCliente.deleta_cliente(matricula);
            res.status(200).json(cliente)

        } catch (error) {

            if (error && error.code) {
                res.status(error.code).send(error.message);
            } else {
                res.status(500).send('deu pau na chamada da Api')
            }
        }
    }

}