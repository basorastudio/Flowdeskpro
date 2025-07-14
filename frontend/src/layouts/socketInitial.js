import Router from 'src/router/index'
import { socketIO } from '../utils/socket'
import { ConsultarTickets } from 'src/service/tickets'
import { ListarUsuariosChatInterno } from 'src/service/user'

const usuario = JSON.parse(localStorage.getItem('usuario'))
const userId = +localStorage.getItem('userId')

export default {
  data() {
    return {
      socket: null
    }
  },
  methods: {
    socketInitial() {
      this.socket = socketIO()

      this.socket.on(`tokenInvalid:${this.socket.id}`, () => {
        this.socket.disconnect()
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('usuario')
        setTimeout(() => {
          Router.push({
            name: 'login'
          })
        }, 1000)
      })

      this.socket.emit(`${usuario.tenantId}:joinNotification`)

      this.socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      this.socket.on(`${usuario.tenantId}:ticketList`, async data => {
        console.log('socket ON')
        if (data.type === 'chat:create') {
          console.log('chat:create')
          if (data.payload.ticket.userId !== userId) return
          if (data.payload.fromMe) return
          const message = new self.Notification('Contacto: ' + data.payload.ticket.contact.name, {
            body: 'Mensaje: ' + data.payload.body,
            tag: 'simple-push-demo-notification',
            image: data.payload.ticket.contact.profilePicUrl,
            icon: data.payload.ticket.contact.profilePicUrl
          })
          console.log(message)
          console.log('mensaje enviado')
          // Actualiza notificaciones de mensajes
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: true,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
            // date: new Date(),
          }
          console.log('Parámetros definidos')
          try {
            console.log('intentando')
            const { data } = await ConsultarTickets(params)
            console.log('intentando 1')
            this.countTickets = data.count // cuenta total de tickets en estado
            console.log('intentando 2')
            // this.ticketsList = data.tickets
            this.$store.commit('UPDATE_NOTIFICATIONS', data)
            console.log('intentando 3')
            // this.$store.commit('SET_HAS_MORE', data.hasMore)
            // console.log(this.notifications)
          } catch (err) {
            console.log('error al intentar')
            this.$notificarErro('Algún problema', err)
            console.error(err)
          }
        }
      })

      this.socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'delete') {
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      this.socket.on(`${usuario.tenantId}:contactList`, data => {
        if (data.type === 'contact:update') {
          console.log('socket ON: CONTACT:UPDATE')
          this.$store.commit('UPDATE_CONTACT', data.payload)
        }
      })

      this.socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
          this.$root.$emit('UPDATE_SESSION', data.session)
        }

        if (data.action === 'readySession') {
          this.$q.notify({
            position: 'top',
            icon: 'mdi-wifi-arrow-up-down',
            message: `La conexión con WhatsApp está lista y habilitada para enviar y recibir mensajes. Conexión: ${data.session.name}. Número: ${data.session.number}.`,
            type: 'positive',
            color: 'primary',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }
      })

      this.socket.on(`${usuario.tenantId}:change_battery`, data => {
        this.$q.notify({
          message: `La batería del celular de WhatsApp ${data.batteryInfo.sessionName} está en ${data.batteryInfo.battery}%. Es necesario iniciar la carga.`,
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      })

      this.socket.on(`${usuario.tenantId}:ticketList`, async data => {
        var verify = []
        if (data.type === 'notification:new') {
          // console.log(data)
          // Actualiza notificaciones de mensajes
          // var data_noti = []
          const params = {
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
          try {
            const data_noti = await ConsultarTickets(params)
            this.$store.commit('UPDATE_NOTIFICATIONS_P', data_noti.data)
            verify = data_noti
          } catch (err) {
            this.$notificarErro('Algún problema', err)
            console.error(err)
          }
          // Verifica si la notificación pertenece a la cola del usuario
          var pass_noti = false
          verify.data.tickets.forEach((element) => { pass_noti = (element.id == data.payload.id ? true : pass_noti) })
          // Muestra la notificación
          if (pass_noti) {
            const message = new self.Notification('Nuevo cliente pendiente', {
              body: 'Cliente: ' + data.payload.contact.name,
              tag: 'simple-push-demo-notification'
            })
            console.log(message)
          }
        }
      })

      this.socket.on(`${usuario.tenantId}:ticketList`, async data => {
        if (data.type === 'chat:ack' || data.type === 'chat:delete') {
          console.log('socket ON: CHAT:ACK')
          this.$store.commit('UPDATE_MESSAGE_STATUS', data.payload)
        }

        if (data.type === 'chat:update') {
          this.$store.commit('UPDATE_MESSAGE', data.payload)
        }
      })

      this.socket.on(`${usuario.tenantId}:mensagem-chat-interno`, data => {
        if (data.action === 'update' && (data.data.receiverId == usuario.userId || data.data.groupId != null)) {
          this.$store.commit('MENSAGEM_INTERNA_UPDATE', data)
        }
      })

      this.socket.on(`${usuario.tenantId}:unread-mensagem-chat-interno`, data => {
        if (data.action === 'update' && data.data.senderId == usuario.userId) {
          this.$store.commit('UNREAD_MENSAGEM_INTERNA_UPDATE', data)
        }
      })

      this.socket.on(`${usuario.tenantId}:mensagem-chat-interno-notificacao`, data => {
        if (data.action === 'update' && (data.data.receiverId == usuario.userId || data.data.groupId != null)) {
          this.$store.commit('NOTIFICACAO_CHAT_INTERNO_UPDATE', data)
        }
      })

      this.socket.on('verifyOnlineUsers', data => {
        this.$store.commit('LISTA_USUARIOS_CHAT_INTERNO', { action: 'updateAllUsers', data: {} })
        this.socket.emit(`${usuario.tenantId}:userVerified`, usuario)
      })

      this.socket.on(`${usuario.tenantId}:user-online`, data => {
        if (data.action === 'update' && data.data.userId !== usuario.userId) {
          this.$store.commit('USER_CHAT_UPDATE', data)
        }
      })

      this.socket.on(`${usuario.tenantId}:updateStatusUser`, async () => {
        const { data } = await ListarUsuariosChatInterno()
        this.$store.commit('LISTA_USUARIOS_CHAT_INTERNO', { action: 'create', data: data.users })
      })
    }
  },
  mounted() {
    this.socketInitial()
  },
  destroyed() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}
