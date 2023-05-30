const express = require('express')
const app = express()
const port = 3000
const oLivroRota = require('./Rotas/livro_rota')
const oClienteRota = require('./Rotas/cliente_rota')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use("/api/livro", oLivroRota);
app.use("/api/cliente", oClienteRota);

app.listen(port, () => {
  console.log(`Biblioteca app executando na porta: ${port}...`)
})
