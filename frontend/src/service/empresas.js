import request from 'src/service/request'

export function MostrarHorariosAtendiemento() {
  return request({
    url: '/tenants/business-hours/',
    method: 'get'
  })
}

export function AtualizarHorariosAtendiemento(data) {
  return request({
    url: '/tenants/business-hours/',
    method: 'put',
    data
  })
}

export function AtualizarMensagemHorariosAtendiemento(data) {
  return request({
    url: '/tenants/message-business-hours/',
    method: 'put',
    data
  })
}

export function AdminListarEmpresas() {
  return request({
    url: '/admin/tenants/',
    method: 'get'
  })
}

export function AdminUpdateStatusEmpresa(tenantId, data) {
  return request({
    url: `/admin/status/tenant/${tenantId}`,
    method: 'put',
    data
  })
}

export function AdminUpdateEmpresa(tenantId, data) {
  return request({
    url: `/admin/empresa/${tenantId}`,
    method: 'put',
    data
  })
}

export function AdminListarEmpresasActive(status = 'active') {
  return request({
    url: '/admin/tenants/',
    method: 'get',
    params: {
      status
    }
  })
}

export function AdminListarUsersBytenant(tenantId) {
  return request({
    url: `/admin/users/${tenantId}`,
    method: 'get'
  })
}

export function CriarTenant(data) {
  return request({
    url: '/admin/tenants/',
    method: 'post',
    data
  })
}

export function AtualizarTenant(data) {
  return request({
    url: '/admin/tenants/' + data.id,
    method: 'put',
    data
  })
}

export function ListarWhatsappsAdmin () {
  return request({
    url: '/admin/channels',
    method: 'get'
  })
}

export function CriarTeste(data) {
  return request({
    url: '/empresa/signup',
    method: 'post',
    data
  })
}

export function MostrarVencimento() {
  return request({
    url: '/tenants/date/',
    method: 'get'
  })
}

export function DeletarTenant (data) {
  return request({
    url: `/admin/tenants/${data.id}`,
    method: 'delete'
  })
}

export function AddMonthTenant (data) {
  return request({
    url: `/admin/tenantsMonth/${data.id}`,
    method: 'post'
  })
}

export function UploadLogo(file, ref) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `/admin/media-upload?ref=${ref}`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function AdminListarInvoices(tenantId) {
  return request({
    url: `/admin/invoices/list/${tenantId}`,
    method: 'get'
  })
}

export function PaidInvoice(data) {
  return request({
    url: '/admin/invoices/' + data.id,
    method: 'put',
    data
  })
}

export function DeletarInvoice (data) {
  return request({
    url: `/admin/invoices/${data.id}`,
    method: 'delete'
  })
}
