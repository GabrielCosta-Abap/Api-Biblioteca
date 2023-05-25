const express = require("express");
const oLivroController = require('../Controller/livro_controller')
const router = express.Router();

router.get('/', oLivroController.listarLivros)
router.get('/:id', oLivroController.buscarLivroPorId)
router.post('/', oLivroController.inserirLivro)
router.put('/:id', oLivroController.atualizaLivro)
router.delete('/:id', oLivroController.deletaLivro)
router.post('/Devolucao', oLivroController.devolucaoLivro)
router.post('/Retirada', oLivroController.retiradaLivro)

module.exports = router;
