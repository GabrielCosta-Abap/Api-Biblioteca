const express = require("express");
const oAutorController = require('../Controller/autor_controller')
const router = express.Router();

router.get('/', oAutorController.listarAutores)

module.exports = router;
