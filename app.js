const express = require('express')
const { send } = require('process')
const app = express()
const port = 3000
const oNegocio = require('./Negocio/negocio')
const oPersistencia = require('./Persistencia/persistencia')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/livros', async(req, res) => {
  try {

    let aLivros = await oNegocio.getLivros()
    if (aLivros.length == 0) {
      res.status(404).send('Nenhum livro encontrado')
    }else{
      res.status(200).send( aLivros )
    }

  } catch (error) {

    if (error && error.code) {
      res.status(error.code).send(error.message)  
    }else{
      res.status(500).send('deu pau na chamada da Api')  
    } 
  }
})
app.get('/livros/:id', async (req, res) => {
  
  try {

    let livro = await oPersistencia._get_livro_by_id(req.params.id)
    livro ? res.status(200).json(livro) : res.status(404).send('Nenhum livro encontrado')

  } catch (error) {

    if (error && error.code) {
      res.status(error.code).send(error.message)  
    }else{
      res.status(500).send('deu pau na chamada da Api')  
    } 
  }  
})

app.post('/livros', async (req, res) => {
  const body = req.body
  
  try {

      await oNegocio.cadastra_livro(body.Isbn, body.Nome, body.AutorId, body.Editora, body.AnoPublicacao)
      res.status(201).json(body)

  } catch (error) {
      if (error && error.code) {
        res.status(error.code).send(error.message)  
      }else{
        res.status(500).send('deu pau na chamada da Api')  
      }
  }

})
app.put('/livros/:id', async(req, res) => {
  const id = req.params.id
  const body = req.body
  body.book_id = id
  try {
    await oNegocio.atualizaLivro(body)
    res.status(200).send('Livro atualizado com sucesso!')
  } catch (error) {
      if (error && error.code) {
        res.status(error.code).send(error.message)  
      }else{
        res.status(500).send('deu pau na chamada da Api')  
      }
  }
})

app.delete('/livros/:id', async (req, res) => {
  const id = req.params.id
  
  try {
      await oNegocio.deletaLivro(id)
      res.status(200).send('Livro eliminado com sucesso!')

  } catch (error) {
      if (error && error.code) {
        res.status(error.code).send(error.message)  
      }else{
        res.status(500).send('deu pau na chamada da Api')  
      }
  }
})

app.post('/DevolucaoLivro', async (req, res) => {

  let oDevolucao = req.body

  try {
      let = nDiasAtraso = await oNegocio.devolucao_livro(oDevolucao.IdLivro, oDevolucao.MatriculaCliente, oDevolucao.RetiradaRef)
      res.status(201).json({message: 'Devolução registrada com sucesso!', atraso: nDiasAtraso })
 }catch (error) {
  if (error && error.code) {
    res.status(error.code).send(error.message)  
  }else{
    res.status(500).send('deu pau na chamada da Api')  
  }
  }
  
})

app.post('/RetiradaLivro', async (req, res) => {
  let body = req.body

  try {
      await oNegocio.retirada_livro(body.MatriculaCliente, body.IdLivro)
      res.status(201).send('Retirada registrada com sucesso!')
  }catch (error) {
    if (error && error.code) {
      res.status(error.code).send(error.message)  
    }else{
      res.status(500).send('deu pau na chamada da Api')  
    } 
  }
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})