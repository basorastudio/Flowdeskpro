<template>
  <div>
    <q-table flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="financeiro"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-left>
        <div>
          <h2  :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-cash-multiple q-pr-sm" />
            Mensualidad / Factura
          </h2>
        </div>

      </template>
      <template v-slot:body-cell-value="props">
        <q-td key="value" :props="props">
          USD$ {{ props.row.value.toFixed(2).replace('.', ',') }}
        </q-td>
      </template>
      <template v-slot:body-cell-dueDate="props">
        <q-td key="dueDate" :props="props">
          {{ formatDate(props.row.dueDate) }}
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td
          key="status"
          :props="props"
          :style="getStatusStyle(props.row.status, props.row.dueDate)"
        >
          {{ getStatusText(props.row.status, props.row.dueDate) }}
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            v-if="props.row.status !== 'paid'"
            color="primary"
            label="PAGAR"
            @click="GerarQRCODE(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showQRCodeModal" persistent>
    <q-card class="container-rounded-10">
      <q-card-section>
        <div class="text-h6 font-family-main text-center">
          Código QR de Pago
          <q-btn round
          flat
            class="q-ml-md float-right"
            color="negative"
            icon="eva-close"
            v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="text-center q-ma-lg container-rounded-10 container-border"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
          <div>Lea el código QR en su aplicación bancaria</div>
          <qrcode-vue :value="qrCodeValue" :size="200"></qrcode-vue>

      <q-card-section>
          <div>
            <q-input
              v-model="pixString"
              readonly
              filled
              class="q-ma-md"
              style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
            />
          </div>
          <q-btn
            class="generate-button btn-rounded-50"
            label="Copiar código QR"
            @click="copiarPixString"
            icon="mdi-content-copy" />
        <div class="text-center q-mb-lg" style="font-size: 14px">Finalmente, simplemente haga el escaneo de pago o pegue el código PIX anterior:) </div>
        <div class="row col-12 justify-center">
        </div>
      </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ListarInvoices, CriarQRCODE } from 'src/service/financeiro'
import { format, parseISO, isBefore, addDays } from 'date-fns'
import QRCodeVue from 'qrcode.vue'

export default {
  name: 'Financeiro',
  components: {
    'qrcode-vue': QRCodeVue
  },
  data () {
    return {
      financeiro: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      showQRCodeModal: false,
      qrCodeValue: '',
      pixString: '',
      UrlPagamentoOpen: '',
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'detail', label: 'Plan', field: 'detail', align: 'left' },
        { name: 'value', label: 'Valor', field: 'value', align: 'center' },
        { name: 'dueDate', label: 'Fecha de Venc.', field: 'dueDate', align: 'center' },
        { name: 'status', label: 'Estado', field: 'status', align: 'center' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    formatDate(date) {
      try {
        return format(parseISO(date), 'dd/MM/yyyy')
      } catch (error) {
        console.error('Formato de fecha no válido:', error)
        return date // Fallback to original date if parsing/formatting fails
      }
    },
    async listarFinanceiro () {
      const { data } = await ListarInvoices()
      this.financeiro = data
    },
    getStatusStyle(status, dueDate) {
      const currentDate = addDays(new Date(), -1)
      const parsedDueDate = parseISO(dueDate)
      if (status === 'paid') {
        return { backgroundColor: 'green', color: 'black', fontWeight: 'bold' }
      } else if (status === 'open') {
        if (isBefore(currentDate, parsedDueDate)) {
          return { backgroundColor: 'yellow', color: 'black', fontWeight: 'bold' }
        } else {
          return { backgroundColor: 'red', color: 'black', fontWeight: 'bold' }
        }
      }
      return {}
    },
    getStatusText(status, dueDate) {
      const currentDate = addDays(new Date(), -1)
      const parsedDueDate = parseISO(dueDate)
      if (status === 'paid') {
        return 'PAGADA'
      } else if (status === 'open') {
        if (isBefore(currentDate, parsedDueDate)) {
          return 'PENDIENTE'
        } else {
          return 'VENCIDA'
        }
      }
      return status
    },
    async GerarQRCODE(row) {
      try {
        const response = await CriarQRCODE({
          firstName: '',
          lastName: '',
          address2: '',
          city: '',
          state: '',
          zipcode: '',
          country: '',
          useAddressForPaymentDetails: false,
          nameOnCard: '',
          cardNumber: '',
          cvv: '',
          price: row.value,
          invoiceId: row.id
        })

        if (response.data.urlPagamento) {
          this.UrlPagamentoOpen = response.data.urlPagamento

          // Exibir mensagem de atualização antes de redirecionar
          this.$q.notify({
            type: 'info',
            message: 'Al realizar el pago, ¡actualice la página!',
            timeout: 10000
          })

          const newWindow = window.open(this.UrlPagamentoOpen, '_blank')

          // Verificar se a nova aba foi bloqueada pelo navegador
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Se a nova aba foi bloqueada, redirecionar a página atual
            window.location.href = this.UrlPagamentoOpen
          } else {
            // Se a nova aba abriu corretamente, exibir um link de fallback
            this.$q.notify({
              type: 'info',
              message: 'Si la página de pago no se abrió, haz clic <a href="#" @click="abrirURLPagamento">aquí</a> para acceder.',
              html: true, // Permitir HTML na notificação
              timeout: 10000 // Manter a notificação visível por mais tempo
            })
          }
        } else if (response.data.qrcode) {
          // Se a resposta contiver um Código QR, mostrar o modal com o Código QR
          this.qrCodeValue = response.data.qrcode.qrcode
          this.pixString = response.data.qrcode.qrcode
          this.showQRCodeModal = true
        } else {
          throw new Error('Respuesta inesperada de backend.')
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al procesar el pago. Inténtalo de nuevo más tarde.'
        })
      }
    },
    abrirURLPagamento() {
      window.open(this.UrlPagamentoOpen, '_blank')
    },
    copiarPixString() {
      navigator.clipboard.writeText(this.pixString).then(() => {
        this.$q.notify({
          type: 'positive',
          message: '¡Código de pix copiado con éxito!'
        })
      }).catch((err) => {
        console.error('Error de copia del código de pix:', err)
        this.$q.notify({
          type: 'negative',
          message: 'Error de copia del código PIX.'
        })
      })
    }
  },
  mounted () {
    this.listarFinanceiro()
  }
}
</script>

<style lang="scss" scoped>
</style>
