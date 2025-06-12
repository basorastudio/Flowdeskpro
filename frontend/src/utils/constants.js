export const estadoPorDdd = {
  // Códigos de área para República Dominicana
  809: 'DO',
  829: 'DO',
  849: 'DO'
}

export const dddsPorEstado = {
  DO: ['809', '829', '849']
}

export const estadosDO = [
  { nome: 'Azua', sigla: 'AZ' },
  { nome: 'Baoruco', sigla: 'BC' },
  { nome: 'Barahona', sigla: 'BR' },
  { nome: 'Dajabón', sigla: 'DJ' },
  { nome: 'Distrito Nacional', sigla: 'DN' },
  { nome: 'Duarte', sigla: 'DU' },
  { nome: 'Elías Piña', sigla: 'EP' },
  { nome: 'El Seibo', sigla: 'ES' },
  { nome: 'Espaillat', sigla: 'ESP' },
  { nome: 'Hato Mayor', sigla: 'HM' },
  { nome: 'Hermanas Mirabal', sigla: 'HMI' },
  { nome: 'Independencia', sigla: 'IN' },
  { nome: 'La Altagracia', sigla: 'LA' },
  { nome: 'La Romana', sigla: 'LR' },
  { nome: 'La Vega', sigla: 'LV' },
  { nome: 'María Trinidad Sánchez', sigla: 'MTS' },
  { nome: 'Monseñor Nouel', sigla: 'MN' },
  { nome: 'Monte Cristi', sigla: 'MC' },
  { nome: 'Monte Plata', sigla: 'MP' },
  { nome: 'Pedernales', sigla: 'PD' },
  { nome: 'Peravia', sigla: 'PV' },
  { nome: 'Puerto Plata', sigla: 'PP' },
  { nome: 'Samaná', sigla: 'SM' },
  { nome: 'San Cristóbal', sigla: 'SC' },
  { nome: 'San José de Ocoa', sigla: 'SJO' },
  { nome: 'San Juan', sigla: 'SJ' },
  { nome: 'San Pedro de Macorís', sigla: 'SPM' },
  { nome: 'Sánchez Ramírez', sigla: 'SR' },
  { nome: 'Santiago', sigla: 'ST' },
  { nome: 'Santiago Rodríguez', sigla: 'STR' },
  { nome: 'Santo Domingo', sigla: 'SD' },
  { nome: 'Valverde', sigla: 'VV' }
]

// Alias para compatibilidad con archivos que esperan estadosBR
export const estadosBR = estadosDO

export const messagesLog = {
  access: {
    message: 'Acessou o ticket',
    color: 'grey-8',
    icon: 'mdi-eye'
  },
  closed: {
    message: 'Resolveu o ticket',
    color: 'positive',
    icon: 'mdi-check-circle-outline'
  },
  create: {
    message: 'Ticket criado',
    color: 'green-6',
    icon: 'mdi-plus-circle'
  },
  delete: {
    message: 'Deletou o Ticket',
    color: 'negative',
    icon: 'mdi-delete'
  },
  open: {
    message: 'Iniciou o atendimento',
    color: 'primary',
    icon: 'mdi-play-circle-outline'
  },
  pending: {
    message: 'Retornou atendimento para fila de pendentes',
    color: 'amber',
    icon: 'mdi-account-convert'
  },
  transfered: {
    message: 'Transferiu o atendimento',
    color: 'teal-3',
    icon: 'mdi-account-arrow-right'
  },
  receivedTransfer: {
    message: 'Recebeu o atendimento por transferência',
    color: 'teal-5',
    icon: 'mdi-account-arrow-left'
  },
  queue: {
    message: 'Bot: Fila definida',
    color: 'green-2',
    icon: 'mdi-arrow-decision'
  },
  userDefine: {
    message: 'Bot: Usuário definido',
    color: 'cyan-2',
    icon: 'mdi-account-check'
  },
  retriesLimitQueue: {
    message: 'Bot: Fila definida (Limite de tentativas)',
    color: 'green-2',
    icon: 'mdi-arrow-decision'
  },
  retriesLimitUserDefine: {
    message: 'Bot: Usuário definido (Limite de tentativas)',
    color: 'cyan-2',
    icon: 'mdi-account-check'
  },
  chatBot: {
    message: 'ChatBot iniciado',
    color: 'blue-4',
    icon: 'mdi-robot'
  },
  autoClose: {
    message: 'Bot: Atendimento fechado pelo cliente',
    color: 'blue-8',
    icon: 'mdi-check-circle-outline'
  }
}
