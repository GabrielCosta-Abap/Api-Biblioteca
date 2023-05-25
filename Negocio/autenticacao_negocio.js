const oPersistencia = require('../Persistencia/autenticacao_persistencia')

module.exports = {
    autentica_usuario: async function (username, password){
        if (!username || !password) {
            console.log('Usuário e senha são obrigatórios')
        }else{
            if (await oPersistencia._autentica_usuario(username, password)) {
                console.log('Usuário autenticado com sucesso!')
                return true
            }else{
                console.log('Usuário ou senha inválidos!')
            }
        }
    }
}