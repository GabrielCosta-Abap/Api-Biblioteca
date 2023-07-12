const express = require('express')
const app = express()
const port = 5000
const oLivroRota = require('./Rotas/livro_rota')
const oClienteRota = require('./Rotas/cliente_rota')
const oAutorRota = require('./Rotas/autor_rota')
const oLoginRota = require('./Rotas/login_rota')
const authMiddleware = require('./middleware/auth_middleware')

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');

  next();
});

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// app.use("/api/login", oLoginRota);

// //A partir daqui aplica o Middleware
// app.use(authMiddleware.verificarToken);

app.use("/api/livro", oLivroRota);
app.use("/api/cliente", oClienteRota);
app.use("/api/autor", oAutorRota);

app.listen(port, () => {
  console.log(`Biblioteca app executando na porta: ${port}...`)
})
