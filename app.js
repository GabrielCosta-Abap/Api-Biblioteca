const express = require('express')
const app = express()
const port = 3000
const oLivroRota = require('./Rotas/livro_rota')
const oClienteRota = require('./Rotas/cliente_rota')
const oLoginRota = require('./Rotas/login_rota')
const authMiddleware = require('./middleware/auth_middleware')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use("/api/login", oLoginRota);

//A partir daqui aplica o Middleware
app.use(authMiddleware.verificarToken);

app.use("/api/livro", oLivroRota);
app.use("/api/cliente", oClienteRota);

app.listen(port, () => {
  console.log(`Biblioteca app executando na porta: ${port}...`)
})
