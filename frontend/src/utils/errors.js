const errors = [
  {
    error: 'ERR_SESSION_EXPIRED',
    description: 'Su conexión ha expirado.',
    detail: 'La validez de su conexión ha expirado. Es necesario iniciar sesión nuevamente.'
  },
  {
    error: 'ERR_API_CONFIG_NOT_FOUND',
    description: 'Configuraciones de API no encontradas.',
    detail: 'Actualice la página e intente nuevamente. Si el error persiste, póngase en contacto con soporte.'
  },
  // {
  //   error: 'ERR_CREATING_MESSAGE',
  //   description: 'Problemas al crear el mensaje vía API.',
  //   detail: 'Verifique si se han enviado toda la información requerida. Intente nuevamente y si el error persiste, contacte con soporte.'
  // },
  {
    error: 'ERR_NO_CONTACT_FOUND',
    description: 'Contacto no encontrado en el sistema.',
    detail: 'Verifique si el número está realmente guardado en el sistema correctamente o registre el contacto.'
  },
  {
    error: 'ERR_DUPLICATED_CONTACT',
    description: 'Contacto ya registrado en el sistema.',
    detail: 'Localice el contacto ya registrado.'
  },
  {
    error: 'ERR_CONTACT_TICKETS_REGISTERED',
    description: 'El contacto no puede ser eliminado.',
    detail: 'El contacto tiene atenciones registradas y no puede ser eliminado para garantizar la integridad de la información.'
  },
  {
    error: 'ERR_CREATING_MESSAGE',
    description: 'El mensaje no fue creado.',
    detail: 'Verifique si la conexión con WhatsApp está activa o si el mensaje no violó los términos de WhatsApp.'
  },
  {
    error: 'ERR_NO_TICKET_FOUND',
    description: 'Atención no encontrada.',
    detail: 'No localizamos la atención informada. Actualice la página (F5) e intente nuevamente. Consulte con soporte si el error persiste.'
  },
  {
    error: 'ERR_AUTO_REPLY_RELATIONED_TICKET',
    description: 'No es posible eliminar el registro.',
    detail: 'El flujo ya ha sido utilizado en varias atenciones.'
  },
  {
    error: 'ERR_NO_AUTO_REPLY_FOUND',
    description: 'Flujo informado no encontrado.',
    detail: 'Verifique si el flujo realmente existe. Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_NO_STEP_AUTO_REPLY_FOUND',
    description: 'No se encontró una etapa para el flujo.',
    detail: 'Verifique el registro de las etapas del chatbot. Confirme si la etapa realmente existe.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS_OR_NOT_ACESSIBLE',
    description: 'Campaña no existe o no está accesible.',
    detail: 'Verifique si la campaña todavía existe o si está disponible.'
  },
  {
    error: 'ERROR_CAMPAIGN_NOT_EXISTS',
    description: 'Campaña no encontrada.',
    detail: 'Verifique si la campaña todavía existe o si está disponible.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_FOUND',
    description: 'Campaña no encontrada.',
    detail: 'Verifique si la campaña todavía existe o si está disponible.'
  },
  {
    error: 'ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING',
    description: 'La campaña no está cancelada o pendiente.',
    detail: 'Solo las campañas en los estados mencionados pueden ser modificadas.'
  },
  {
    error: 'ERROR_CAMPAIGN_DATE_NOT_VALID',
    description: 'Fecha de programación inválida.',
    detail: 'La fecha debe ser mayor que la fecha actual.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND',
    description: 'La campaña no existe.',
    detail: 'La campaña no fue encontrada. Actualice la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS',
    description: 'La campaña no existe. Contactos no vinculados.',
    detail: 'Posiblemente la campaña ya fue eliminada y no existen contactos vinculados. Actualice la página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS',
    description: 'Problema con la campaña.',
    detail: 'Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_NO_FAST_REPLY_FOUND',
    description: 'Respuesta rápida no encontrada.',
    detail: 'Verifique si el registro realmente existe. Actualice la página e intente nuevamente.'
  },
  {
    error: 'ERR_FAST_REPLY_EXISTS',
    description: 'La respuesta rápida no existe.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_NO_QUEUE_FOUND',
    description: 'Fila no encontrada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_QUEUE_TICKET_EXISTS',
    description: 'Fila con atenciones vinculadas.',
    detail: 'No es posible eliminar el registro para mantener la integridad de la información.'
  },
  {
    error: 'ERR_NO_TAG_FOUND',
    description: 'Etiqueta no encontrada.',
    detail: 'Posiblemente el registro ya fue eliminado. Actualice la página.'
  },
  {
    error: 'ERR_TAG_CONTACTS_EXISTS',
    description: 'Etiqueta con contactos vinculados.',
    detail: 'No es posible eliminar el registro para mantener la integridad de la información.'
  },
  {
    error: 'ERR_NO_SETTING_FOUND',
    description: 'Configuración no existe.',
    detail: 'Actualice la página e intente nuevamente. Consulte con soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_TENANT_FOUND',
    description: 'No encontramos una empresa registrada o activa.',
    detail: 'Actualice la página e intente nuevamente. Consulte con soporte si el error persiste.'
  },
  {
    error: 'ERR_CREATING_TICKET',
    description: 'No fue posible crear la atención.',
    detail: 'Actualice la página e intente nuevamente. Consulte con soporte si el error persiste.'
  },
  {
    error: 'ERR_NO_STATUS_SELECTED',
    description: 'No se seleccionó ningún estado.',
    detail: 'Es necesario seleccionar un estado para listar las atenciones.'
  },
  {
    error: 'ERR_INVALID_CREDENTIALS',
    description: 'Usuario y/o contraseña inválidos.',
    detail: 'Los datos de inicio de sesión son inválidos. Si el problema persiste, contacte con un administrador del sistema para restablecer las credenciales.'
  },
  {
    error: 'ERR_NO_USER_FOUND',
    description: 'Usuario no encontrado.',
    detail: 'Verifique si el usuario realmente existe. Actualice la página si es necesario.'
  },
  {
    error: 'ERR_WAPP_INVALID_CONTACT',
    description: 'El número informado en el contacto es inválido.',
    detail: 'El número no es un contacto vinculado a una cuenta de WhatsApp.'
  },
  {
    error: 'ERR_WAPP_CHECK_CONTACT',
    description: 'Ocurrió un error al validar el contacto por WhatsApp.',
    detail: 'Verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en unos instantes.'
  },
  {
    error: 'ERR_DELETE_WAPP_MSG',
    description: 'WhatsApp no permitió eliminar el mensaje.',
    detail: 'No es posible eliminar mensajes antiguos. Si el mensaje es de las últimas 24h, verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en unos instantes.'
  },
  {
    error: 'ERR_SENDING_WAPP_MSG',
    description: 'Mensaje no enviado por WhatsApp.',
    detail: 'Verifique si la conexión con WhatsApp está activa. Si es necesario, actualice la página e intente nuevamente en unos instantes.'
  },
  {
    error: 'ERR_WAPP_NOT_INITIALIZED',
    description: 'Sesión con WhatsApp no iniciada.',
    detail: 'Verifique el estado de la conexión con WhatsApp en el sistema. Es necesario que la conexión se establezca correctamente.'
  },
  {
    error: 'ERR_CONTACTS_NOT_EXISTS_WHATSAPP',
    description: 'El contacto no existe en WhatsApp.',
    detail: 'El número no es un contacto válido para WhatsApp.'
  },
  {
    error: 'ERR_NO_WAPP_FOUND',
    description: 'Sesión no encontrada.',
    detail: 'Verifique si el registro realmente existe. Si es necesario, actualice la página.'
  },
  {
    error: 'ERR_OTHER_OPEN_TICKET',
    description: 'Ya existe una atención abierta para el contacto.',
    detail: 'Localice el contacto en la lista de atenciones.'
  },
  {
    error: 'ERR_NO_DEF_WAPP_FOUND',
    description: 'No existe una conexión marcada como "POR DEFECTO".',
    detail: 'Es necesario realizar la definición en el menú de sesiones.'
  },
  {
    error: 'ERR_FETCH_WAPP_MSG',
    description: 'No fue posible encontrar mensajes.',
    detail: 'Valide el estado de la conexión con WhatsApp.'
  },
  {
    error: 'ERR_NO_PERMISSION',
    description: 'Usuario sin permiso.',
    detail: 'Su usuario no tiene permiso para realizar la acción.'
  }

]

export default errors
