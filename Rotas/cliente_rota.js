const express = require("express");
const oClienteController = require('../Controller/cliente_controller')
const router = express.Router();

router.post('/', oClienteController.inserirCliente)
router.get('/', oClienteController.listarClientes)
router.get('/:matricula', oClienteController.buscarClientePorId)
router.put('/:matricula', oClienteController.atualizaCliente)
router.delete('/:matricula', oClienteController.deletaCliente)

module.exports = router;
