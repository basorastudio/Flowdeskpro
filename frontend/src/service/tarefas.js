import request from 'src/service/request'

export function CriarTarefa (data) {
  return request({
    url: '/tasks/',
    method: 'post',
    data
  })
}

export function ListarTarefas () {
  return request({
    url: '/tasks/',
    method: 'get'
  })
}

export function AlterarTarefa (data) {
  return request({
    url: `/tasks/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarTarefa (data) {
  return request({
    url: `/tasks/${data.id}`,
    method: 'delete'
  })
}

export function ConsultarResumoTarefas(params) {
  return request({
    url: '/tasks/summary',
    method: 'post',
    data: params
  })
}
