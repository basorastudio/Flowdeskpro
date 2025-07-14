import { AtualizarStatusTicket, EnviarMensagemTexto, AtualizarTicket } from 'src/service/tickets'
import { ListarDespedidas } from 'src/service/despedida'
const userId = +localStorage.getItem('userId')
import { uid } from 'quasar'

export default {
  data() {
    return {
      despedidas: [] // Almacena los mensajes de despedida
    }
  },
  methods: {
    // Método para listar las despedidas
    async listarDespedidas () {
      try {
        const { data } = await ListarDespedidas()
        this.despedidas = data.farewellMessages // Corregido el nombre de la propiedad
        console.log(this.despedidas) // Muestra las despedidas en la consola para depuración
      } catch (error) {
        console.error('Error al listar despedidas:', error)
      }
    },
    // Iniciar atención
    async iniciarAtendimento(ticket) {
      this.loading = true
      const contactName = (ticket.contact && ticket.contact.name) || (this.contatoSelecionado ? this.contatoSelecionado.name : 'Cliente')
      try {
        await AtualizarStatusTicket(ticket.id, 'open', userId)
        this.loading = false
        this.$q.notify({
          message: `Atención Iniciada || ${contactName} - Ticket: ${ticket.id}`,
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.$store.commit('TICKET_FOCADO', {})
        this.$store.commit('SET_HAS_MORE', false)
        this.$store.dispatch('AbrirChatMensagens', ticket)
      } catch (error) {
        this.loading = false
        console.error(error)
        this.$notificarErro('No fue posible actualizar el estado', error)
      }
    },

    async atualizarStatusTicket2 (ticket) {
      const contatoName = ticket.contact.name || ''
      const ticketId = ticket.id
      const userId = this.$store.state.user.id // Obtener el userId del store
      const title = '¿Finalizar la atención?'
      const toast = '¡Atención finalizada!'

      // Listar despedidas
      await this.listarDespedidas()

      const dialogOptions = {
        title: title,
        message: `Cliente: ${contatoName} || Ticket: ${ticketId}`,
        options: {
          model: null,
          items: this.despedidas.map((despedida) => ({
            label: despedida.message.substring(0, 15) + '...',
            value: despedida.id
          }))
        },
        cancel: {
          label: 'No',
          color: 'negative',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'primary',
          push: true
        },
        persistent: true
      }

      this.$q.dialog(dialogOptions).onOk(async (despedidaId) => {
        this.loading = true

        const despedidaSelecionada = this.despedidas.find(
          (despedida) => despedida.id === despedidaId
        )

        if (despedidaSelecionada) {
          const message = {
            read: 1,
            fromMe: true,
            mediaUrl: '',
            body: despedidaSelecionada.message,
            scheduleDate: null,
            quotedMsg: null,
            idFront: uid() // Generar un ID único
          }

          try {
            await EnviarMensagemTexto(ticketId, message)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: 'El mensaje de despedida se está enviando y el ticket se cerrará dentro de 30 segundos.',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            try {
              await AtualizarTicket(ticketId, {
                isFarewellMessage: true
              })
            } catch (e) {
              console.error('Error al actualizar el ticket:', e)
            }
            await new Promise(resolve => setTimeout(resolve, 30000)) // Espera 30 segundos
          } catch (e) {
            console.error('Error al enviar el mensaje de despedida:', e)
          }
        }

        // Finalizar el ticket después de enviar la despedida
        AtualizarStatusTicket(ticketId, 'closed', userId)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: `${toast} || ${contatoName} (Ticket ${ticketId})`,
              type: 'positive',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.$store.commit('TICKET_FOCADO', {})
            this.$router.push({ name: 'chat-empty' }) // Redirige a la página 'chat-empty'
          })
          .catch(error => {
            this.loading = false
            this.$q.notify({
              message: 'Error al finalizar la atención.',
              type: 'warning',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            console.error(error)
            this.$notificarErro('No fue posible finalizar la atención', error)
          })
      })
    },

    // Actualizar el estado del ticket e incluir despedidas al finalizar
    async atualizarStatusTicket(status) {
      const contatoName = this.ticketFocado.contact.name || ''
      const ticketId = this.ticketFocado.id
      const title = {
        open: '¿Iniciar atención, ok?',
        pending: '¿Volver a la fila?',
        closed: '¿Finalizar la atención?'
      }
      const toast = {
        open: '¡Atención iniciada!',
        pending: '¡Devuelto a la fila!',
        closed: '¡Atención finalizada!'
      }

      let dialogOptions = {
        title: title[status],
        message: `Cliente: ${contatoName} || Ticket: ${ticketId}`,
        cancel: {
          label: 'No',
          color: 'negative',
          push: true
        },
        persistent: true
      }

      if (status === 'closed') {
        await this.listarDespedidas() // Lista las despedidas disponibles
        dialogOptions = {
          ...dialogOptions,
          options: {
            model: null,
            items: this.despedidas.map((despedida) => ({
              label: despedida.message.substring(0, 15) + '...',
              value: despedida.id
            }))
          },
          ok: {
            label: 'Sí',
            color: 'primary',
            push: true
          }
        }
      } else {
        dialogOptions = {
          ...dialogOptions,
          ok: {
            label: 'Sí',
            color: 'primary',
            push: true
          }
        }
      }

      this.$q.dialog(dialogOptions).onOk(async (data) => {
        this.loading = true
        if (status === 'closed' && data !== null) {
          const despedidaSelecionada = this.despedidas.find(
            (despedida) => despedida.id === data
          )
          if (despedidaSelecionada) {
            const message = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: despedidaSelecionada.message,
              scheduleDate: null,
              quotedMsg: null,
              idFront: uid()
            }
            try {
              await EnviarMensagemTexto(ticketId, message)
              this.$q.notify({
                type: 'positive',
                progress: true,
                position: 'top',
                message: '¡El mensaje seleccionado se está enviando y el ticket se cerrará dentro de 30 segundos!',
                actions: [{
                  icon: 'close',
                  round: true,
                  color: 'white'
                }]
              })
              try {
                await AtualizarTicket(this.ticketFocado.id, {
                  isFarewellMessage: true
                })
              } catch (e) {
                console.error('Error al actualizar el ticket:', e)
              }
              await new Promise(resolve => setTimeout(resolve, 30000)) // Espera 30 segundos
            } catch (e) {
              console.error('Error al enviar el mensaje de despedida:', e)
            }
          }
        }

        // Cambiar el userId a null si el estado es 'pending'
        const userIdToUpdate = status === 'pending' ? null : userId

        AtualizarStatusTicket(ticketId, status, userIdToUpdate)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: `${toast[status]} || ${contatoName} (Ticket ${ticketId})`,
              type: 'positive',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.$store.commit('TICKET_FOCADO', {})
            if (status !== 'open') this.$router.push({ name: 'chat-empty' })
          })
          .catch(error => {
            this.loading = false
            this.$q.notify({
              message: 'Atención en esta conexión ya iniciada o solicite al administrador abrir una nueva atención en la opción contacto.',
              type: 'warning',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            console.error('Error al actualizar el estado:', error)
          })
      })
    }

  }
}
