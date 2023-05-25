// const { oPersistencia } = require('./Persistencia/persistencia')
const oNegocio = require('./Negocio/negocio')
// const produtoNegocio = require('./negocio/produto_negocio')

async function main(){

    const autenticacao = await oNegocio.autentica_usuario('ADM', 'ADM123')
    console.log('---------------------------------')

    if (autenticacao) {

        //  await oNegocio.cadastra_livro(105, 'glória maria', 1, 'bacanão', '2006')
        //  await oNegocio.cadastra_autor('Ries', 'BR')
        //  await oNegocio.cadastra_cliente('Olavshdfnha', '(51)97777-7778')
        //  await oNegocio.retirada_livro(2, 3)
        //  await oNegocio.devolucao_livro(2,1,2)
    }
}

main()