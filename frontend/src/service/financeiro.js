import request from 'src/service/request'

export function ListarInvoices () {
  return request({
    url: '/invoices/all/',
    method: 'get'
  })
}

export function CriarQRCODE (data) {
  return request({
    url: '/subscription/',
    method: 'post',
    data
  })
}
