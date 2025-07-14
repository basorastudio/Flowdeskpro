import request from 'src/service/request'

export function ListarDespedidas () {
  return request({
    url: '/farewellMessages/',
    method: 'get'
  })
}

export function ListarDespedidasAll () {
  return request({
    url: '/farewellMessages/all/',
    method: 'get'
  })
}

export function CriarDespedida (data) {
  return request({
    url: '/farewellMessages/',
    method: 'post',
    data
  })
}

export function DeletarDespedida (data) {
  return request({
    url: `/farewellMessages/${data.id}`,
    method: 'delete'
  })
}

export function AlterarDespedida (data) {
  return request({
    url: `/farewellMessages/${data.id}`,
    method: 'put',
    data
  })
}
