const checkTicketFilter = (ticket) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
    // date: new Date(),
  }

  const NotViewTicketsChatBot = () => {
    const configuraciones = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuraciones?.find(c => c.key === 'NotViewTicketsChatBot')
    return (conf?.value === 'enabled')
  }

  const DirectTicketsToWallets = () => {
    const configuraciones = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuraciones?.find(c => c.key === 'DirectTicketsToWallets')
    return (conf?.value === 'enabled')
  }

  const isNotViewAssignedTickets = () => {
    const configuraciones = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuraciones?.find(c => c.key === 'NotViewAssignedTickets')
    return (conf?.value === 'enabled')
  }

  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues'))
  const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
  const profile = localStorage.getItem('profile')
  const isAdminShowAll = profile === 'admin' && filtros.showAll
  const isQueuesTenantExists = filasCadastradas.length > 0

  const userId = usuario?.userId || +localStorage.getItem('userId')

  // Verificar si es admin y si está solicitando mostrar todos
  if (isAdminShowAll) {
    console.log('isAdminShowAll', isAdminShowAll)
    return true
  }

  // Si el ticket es un grupo, todos pueden verificar.
  if (ticket.isGroup) {
    console.log('ticket.isGroup', ticket.isGroup)
    return true
  }

  // Si el estado del ticket es diferente al filtrado, retornar false
  if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
    console.log('Estado del ticket', filtros.status, ticket.status)
    return false
  }

  // Verificar si ya es un ticket del usuario
  if (ticket?.userId == userId) {
    console.log('Ticket del usuario', ticket?.userId, userId)
    return true
  }

  // No visualizar tickets que aún estén con el Chatbot
  // siempre que aún no exista usuario o fila definida
  if (NotViewTicketsChatBot() && ticket.autoReplyId) {
    if (!ticket?.userId && !ticket.queueId) {
      console.log('NotViewTicketsChatBot y el ticket no tiene usuario ni fila definida')
      return false
    }
  }

  // Si el ticket no tiene fila definida, verificar el filtro
  // Permitir visualizar tickets sin filas definidas es falso.
  // if (isQueuesTenantExists && !ticket.queueId && !filtros.includeNotQueueDefined) {
  //   console.log('filtros.includeNotQueueDefined', ticket.queueId, !filtros.includeNotQueueDefined)
  //   return false
  // }

  let isValid = true

  // Verificar si el usuario tiene fila permitida
  if (isQueuesTenantExists) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      console.log('Fila del ticket permitida para el Usuario', ticket.queueId)
      isValid = true
    } else {
      console.log('El Usuario no tiene acceso a la fila', ticket.queueId)
      return false
    }
  }

  // Verificar si la fila del ticket está filtrada
  if (isQueuesTenantExists && filtros?.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue == -1) {
      console.log('Filas filtradas y diferentes a la del ticket', ticket.queueId)
      return false
    }
  }

  // Si la configuración para cartera está activa: verificar si ya es un ticket de la cartera del usuario
  if (DirectTicketsToWallets() && (ticket?.contact?.wallets?.length || 0) > 0) {
    const idx = ticket?.contact?.wallets.findIndex(w => w.id == userId)
    if (idx !== -1) {
      console.log('Ticket de la cartera del usuario')
      return true
    }
    console.log('DirectTicketsToWallets: El ticket no pertenece a la cartera del usuario', ticket)
    return false
  }

  // Verificar si el parámetro para no permitir visualizar
  // tickets asignados a otros usuarios está activo
  if (isNotViewAssignedTickets() && (ticket?.userId || userId) !== userId) {
    console.log('isNotViewAssignedTickets y el ticket no es del usuario', ticket?.userId, userId)
    // Si el usuario no está asignado, permitir visualizar
    if (!ticket?.userId) {
      return true
    }
    return false
  }

  // Verificar si el filtro solo tickets no asignados (isNotAssigned) está activo
  if (filtros.isNotAssignedUser) {
    console.log('isNotAssignedUser activo para mostrar solo tickets no asignados', filtros.isNotAssignedUser, !ticket.userId)
    return filtros.isNotAssignedUser && !ticket.userId
  }

  return isValid
}

export default checkTicketFilter
