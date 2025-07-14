import request from 'src/service/request'

export function ListarConfiguracoesGeneral (params) {
  return request({
    url: '/settingsgeneral/',
    method: 'get',
    params
  })
}

export function AlterarConfiguracaoGeneral (data) {
  return request({
    url: `/settingsgeneral/${data.Key}/`,
    method: 'put',
    data
  })
}

export function enviarArquivoPrivado(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/settings/privateFile',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function ListarConfiguracaoPublica(settingKey) {
  return request({
    url: `/public-settings/${settingKey}`,
    method: 'get'
  })
}
