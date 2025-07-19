import request from 'src/service/request'

export function baileysConnect (whatsappId) {
  return request({
    url: `/baileys/${whatsappId}/connect`,
    method: 'post'
  })
}

export function baileysQR (whatsappId) {
  return request({
    url: `/baileys/${whatsappId}/qr`,
    method: 'get'
  })
}

export function baileysStatus (whatsappId) {
  return request({
    url: `/baileys/${whatsappId}/status`,
    method: 'get'
  })
}

export function baileysSendMessage (whatsappId, data) {
  return request({
    url: `/baileys/${whatsappId}/send-message`,
    method: 'post',
    data
  })
}

export function baileysSendImage (whatsappId, data) {
  return request({
    url: `/baileys/${whatsappId}/send-image`,
    method: 'post',
    data
  })
}

export function baileysSendButtons (whatsappId, data) {
  return request({
    url: `/baileys/${whatsappId}/send-buttons`,
    method: 'post',
    data
  })
}

export function baileysDisconnect (whatsappId) {
  return request({
    url: `/baileys/${whatsappId}/disconnect`,
    method: 'post'
  })
}
