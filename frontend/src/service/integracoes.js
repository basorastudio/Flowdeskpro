import request from 'src/service/request'

export function CriarIntegracao (data) {
  return request({
    url: '/queueIntegration/',
    method: 'post',
    data
  })
}

export function ListarIntegracoes () {
  return request({
    url: '/queueIntegration/',
    method: 'get'
  })
}

export function AlterarIntegracao (data) {
  return request({
    url: `/queueIntegration/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarIntegracao (data) {
  return request({
    url: `/queueIntegration/${data.id}`,
    method: 'delete'
  })
}

export function DadosIntegracao(integrationId) {
  return request({
    url: `/queueIntegration/${integrationId}`,
    method: 'get'
  })
}
