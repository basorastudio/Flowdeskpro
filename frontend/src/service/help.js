import request from 'src/service/request'

export function ListarHelp(params) {
  return request({
    url: '/helps/',
    method: 'get',
    params
  })
}

export function DeleteHelp(helpId) {
  return request({
    url: `/helps/${helpId}`,
    method: 'delete'
  })
}

export function UpdateHelp(helpId, data) {
  return request({
    url: `/helps/${helpId}`,
    method: 'put',
    data
  })
}

export function CriarHelp(data) {
  return request({
    url: '/helps',
    method: 'post',
    data
  })
}

export function DadosHelp(helpId) {
  return request({
    url: `/helps/${helpId}`,
    method: 'get'
  })
}

export function ListarHelpList(params) {
  return request({
    url: '/helps/list/',
    method: 'get',
    params
  })
}
