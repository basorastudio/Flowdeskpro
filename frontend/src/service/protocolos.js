import request from 'src/service/request'

export function ListarProtocolos(params) {
  return request({
    url: '/protocol',
    method: 'get',
    params
  })
}
