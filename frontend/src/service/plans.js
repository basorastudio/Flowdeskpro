import request from 'src/service/request'

export function listPublic(params) {
  return request({
    url: '/plans/listpublic',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: '/plans/list',
    method: 'get',
    params
  })
}

export function Deletarplano(data) {
  return request({
    url: `/plans/${data.id}`,
    method: 'delete'
  })
}

export function CriarPlano(data) {
  return request({
    url: '/plans/',
    method: 'post',
    data
  })
}

export function AlterarPlano(data) {
  return request({
    url: `/plans/${data.id}`,
    method: 'put',
    data
  })
}
