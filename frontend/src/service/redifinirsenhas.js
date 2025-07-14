import request from 'src/service/request'

export function enviarEmailRedefinicao(email) {
  return request({
    url: `/forgetpassword/${email}`,
    method: 'post'
  })
}

export function redefinirSenha(email, codigoVerificacao, novaSenha) {
  return request({
    url: `/resetpasswords/${email}/${codigoVerificacao}/${novaSenha}`,
    method: 'post'
  })
}
