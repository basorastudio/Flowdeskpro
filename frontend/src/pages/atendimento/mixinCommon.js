import { format, parseISO, parseJSON } from 'date-fns'
import es from 'date-fns/locale/es'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['mensagensTicket', 'ticketFocado', 'hasMore'])
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 200)
    },
    dataInWords (date) {
      return format(parseJSON(date), 'HH:mm', { locale: es })
    },
    formatarMensagemWhatsapp (body) {
      if (!body) return
      let formatado = body
      function isAlphanumeric (c) {
        const x = c.charCodeAt()
        return (x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)
      }
      function whatsappStyles (texto, wildcard, opTag, clTag) {
        const indices = []
        for (let i = 0; i < texto.length; i++) {
          if (texto[i] === wildcard) {
            if (indices.length % 2) {
              if (texto[i - 1] !== ' ' && (typeof texto[i + 1] === 'undefined' || !isAlphanumeric(texto[i + 1]))) {
                indices.push(i)
              }
            } else {
              if (typeof texto[i + 1] !== 'undefined' && texto[i + 1] !== ' ' && (typeof texto[i - 1] === 'undefined' || !isAlphanumeric(texto[i - 1]))) {
                indices.push(i)
              }
            }
          } else if (texto[i].charCodeAt() === 10 && indices.length % 2) {
            indices.pop()
          }
        }
        if (indices.length % 2) indices.pop()
        let offset = 0
        indices.forEach((v, i) => {
          const tag = i % 2 ? clTag : opTag
          formatado = formatado.slice(0, v + offset) + tag + formatado.slice(v + offset + 1)
          offset += tag.length - 1
        })
        return formatado
      }
      formatado = whatsappStyles(formatado, '_', '<i>', '</i>')
      formatado = whatsappStyles(formatado, '*', '<b>', '</b>')
      formatado = whatsappStyles(formatado, '~', '<s>', '</s>')
      formatado = formatado.replace(/\n/g, '<br>')
      return formatado
    },
    formatarBotaoWhatsapp (body) {
      if (!body) return
      let formatado = body

      function isAlphanumeric (c) {
        const x = c.charCodeAt()
        return (x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)
      }

      const whatsappStyles = (texto, wildcard, opTag, clTag) => {
        const indices = []
        try {
          for (let i = 0; i < texto.length; i++) {
            if (texto[i] === wildcard) {
              if (indices.length % 2) {
                if (texto[i - 1] !== ' ' && (typeof texto[i + 1] === 'undefined' || !isAlphanumeric(texto[i + 1]))) {
                  indices.push(i)
                }
              } else {
                if (typeof texto[i + 1] !== 'undefined' && texto[i + 1] !== ' ' && (typeof texto[i - 1] === 'undefined' || !isAlphanumeric(texto[i - 1]))) {
                  indices.push(i)
                }
              }
            } else if (texto[i].charCodeAt() === 10 && indices.length % 2) {
              indices.pop()
            }
          }
          if (indices.length % 2) indices.pop()
          let offset = 0
          indices.forEach((v, i) => {
            const tag = i % 2 ? clTag : opTag
            formatado = formatado.slice(0, v + offset) + tag + formatado.slice(v + offset + 1)
            offset += tag.length - 1
          })
        } catch (error) {
          console.error('Erro ao aplicar estilos do WhatsApp:', error)
        }
        return formatado
      }

      try {
        // Quebra o body em linhas
        const linhas = body.trim().split('\n')
        const tituloDescricao = linhas.shift() + '\n' // Primeira linha é o título
        const botoes = linhas.filter(btn => btn.trim() !== '').map(btn => {
          return `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title="Esse botão só é clicável no celular">➡️ ${btn.trim()}</button>`
        })
        formatado = [tituloDescricao, ...botoes].join('\n')
        formatado = whatsappStyles(formatado, '_', '<i>', '</i>')
        formatado = whatsappStyles(formatado, '*', '<b>', '</b>')
        formatado = whatsappStyles(formatado, '~', '<s>', '</s>')
        formatado = formatado.replace(/\n/g, '<br>')
        return formatado
      } catch (error) {
        console.error('Erro ao formatar botão do WhatsApp:', error)
        return body
      }
    },
    formatarData (data, formato = 'dd/MM/yyyy') {
      return format(parseISO(data), formato, { locale: es })
    }
  }
}
