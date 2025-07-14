<template>
  <div class="mass-container container-rounded-10" :class="$q.dark.isActive ? 'text-green bg-grey-10' : 'container-border'" v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item-label header :class="['text-bold text-h6 q-mb-lg', $q.dark.isActive ? 'text-green' : 'text-black']">
        Configuraciones
      </q-item-label>
      <q-item-label caption class="q-mt-lg q-pl-sm">Módulo: Atención</q-item-label>
      <q-separator spaced />

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>No visualizar Tickets ya asignados a otros usuarios</q-item-label>
          <q-item-label caption>Solamente el usuario responsable del ticket y/o los administradores visualizarán la atención.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="NotViewAssignedTickets" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('NotViewAssignedTickets')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>No visualizar Tickets en el ChatBot</q-item-label>
          <q-item-label caption>Solamente los administradores podrán visualizar tickets que estén interactuando con el ChatBot.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="NotViewTicketsChatBot" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('NotViewTicketsChatBot')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Habilitar guía de atención de Chatbots</q-item-label>
          <q-item-label caption> Habilitando esta opción se añadirá una guía de atención exclusiva para los chatbots. </q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="chatbotLane"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="chatbotLane === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('chatbotLane')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Habilitar ocultar guías de atención sin tickets</q-item-label>
          <q-item-label caption>Habilitando esta opción solamente las guías de atención con tickets serán visibles.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="hidetab" false-value="disabled" true-value="enabled" checked-icon="check"
                    keep-color :color="hidetab === 'enabled' ? 'green' : 'negative'" size="md"
                    unchecked-icon="clear" @input="atualizarConfiguracao('hidetab')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Solamente los administradores pueden acceder a la lista de contactos</q-item-label>
          <q-item-label caption>Solamente los administradores visualizarán la lista de contactos en el sistema.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="ContactAdmin" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="ContactAdmin === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('ContactAdmin')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Forzar atención mediante Cartera</q-item-label>
          <q-item-label caption>Si el contacto tiene una cartera vinculada, el sistema dirigirá la atención solamente a los dueños de la cartera de clientes.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="DirectTicketsToWallets" false-value="disabled" true-value="enabled" checked-icon="check"
                    keep-color :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'" size="md"
                    unchecked-icon="clear" @input="atualizarConfiguracao('DirectTicketsToWallets')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Flujo activo para el Bot de atención</q-item-label>
          <q-item-label caption>Flujo a ser utilizado por el Bot para las nuevas atenciones</q-item-label>
        </q-item-section>
        <q-btn  @click="resetarFluxoAtivo"
            flat
            icon="mdi-replay"
            color="negative"
            class="bg-padrao btn-rounded" >
          <q-tooltip content-class="bg-negative text-bold">
            Reiniciar Flujo Chatbot
          </q-tooltip>
        </q-btn>
        <q-item-section avatar>
          <q-select style="width: 300px" outlined dense v-model="botTicketActive" :options="listaChatFlow" map-options
            emit-value option-value="id" option-label="name" @input="atualizarConfiguracao('botTicketActive')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Ignorar Mensajes de Grupo</q-item-label>
          <q-item-label caption>Habilitando esta opción el sistema no abrirá ticket para grupos</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="ignoreGroupMsg" false-value="disabled" true-value="enabled" checked-icon="check" keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'" size="md" unchecked-icon="clear"
            @input="atualizarConfiguracao('ignoreGroupMsg')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Rechazar llamadas en Whatsapp</q-item-label>
          <q-item-label caption>Cuando esté activo, las llamadas de audio y video serán rechazadas, automáticamente.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="rejectCalls" false-value="disabled" true-value="enabled" checked-icon="check" keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'" size="md" unchecked-icon="clear"
            @input="atualizarConfiguracao('rejectCalls')" />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="rejectCalls === 'enabled'">
        <div class="col-12">
          <q-input v-model="callRejectMessage" type="textarea" autogrow dense outlined
            label="Mensaje al rechazar la llamada:" input-style="min-height: 6vh; max-height: 9vh;" debounce="700"
            @input="atualizarConfiguracao('callRejectMessage')" />
        </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Permitir que el usuario deshabilite la firma</q-item-label>
          <q-item-label caption>Los usuarios podrán desactivar la firma de los mensajes</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="userDisableSignature" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="userDisableSignature === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('userDisableSignature')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Listar solo los contactos de la cartera del Usuario</q-item-label>
          <q-item-label caption>Sólo se listarán los contactos de la cartera vinculada al usuario</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="userContactWallet" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="userContactWallet === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('userContactWallet')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Usuarios pueden espiar ticket</q-item-label>
          <q-item-label caption>Desactivando esta opción solamente los administradores pueden ver mensajes antes de iniciar la atención</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="spyticket" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="spyticket === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('spyticket')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Usuarios pueden reabrir ticket</q-item-label>
          <q-item-label caption>Desactivando esta opción solamente los administradores pueden reabrir tickets cerrados</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle v-model="userReopenTicket" false-value="disabled" true-value="enabled" checked-icon="check"
            keep-color :color="userReopenTicket === 'enabled' ? 'green' : 'negative'" size="md"
            unchecked-icon="clear" @input="atualizarConfiguracao('userReopenTicket')" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Contador en las pestañas superiores (Privados/Grupos)</q-item-label>
          <q-item-label caption> Habilitando esta opción el usuario visualizará los tickets con mensajes abiertos en las pestañas superiores de conversaciones privadas y grupos. </q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="universalCounter"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="universalCounter === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('universalCounter')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
<q-item-label>Resolver atención sin interacción automáticamente</q-item-label>
<q-item-label caption>Si no hay respuesta por parte del contacto, el ticket se cerrará automáticamente.</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="autoClose"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="autoClose === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('autoClose')"
        />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="autoClose === 'enabled'">
        <div class="col-12">
          <q-select
            v-model="autoCloseTime"
            :options="tempoOptions"
            outlined
            label="Elija una opción (tiempo en minutos)"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('autoCloseTime')"
          />
        </div>
      </div>

      <div class="row q-px-md" v-if="autoClose === 'enabled'">
        <div class="col-12">
          <q-input
            v-model="autoCloseMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensaje de cierre"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('autoCloseMessage')"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
<q-item-label>Si el agente tarda en responder, devolver tickets a Pendientes</q-item-label>
<q-item-label caption>Si el agente tarda en responder al contacto, el ticket volverá automáticamente a los Tickets pendientes.</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="autoPending"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="autoPending === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('autoPending')"
        />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="autoPending === 'enabled'">
        <div class="col-12">
          <q-input
              v-model="autoPendingTime"
              type="number"
              label="Tiempo en minutos para volver a Pendientes"
              dense
              outlined
              autogrow
              debounce="700"
              input-style="min-height: 6vh; max-height: 9vh;"
              @input="atualizarConfiguracao('autoPendingTime')"
            />
        </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Máximo de veces que el mensaje de horario de atención debe ser enviado al cliente.</q-item-label>
            <q-item-label caption>Inserte aquí la cantidad de veces que el mensaje de ausencia puede ser enviado para cada atención...</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
              v-model="maxRetriesBusinessHours"
              type="number"
              dense
              outlined
              debounce="700"
              @input="atualizarConfiguracao('maxRetriesBusinessHours')"
              style="width: 300px"
            />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Cantidad de tickets abiertos/pendientes que se cargará en la pantalla de atención.</q-item-label>
          <q-item-label caption>Inserte aquí la cantidad de tickets que se cargará en la pantalla de atención...</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
            v-model="TicketsLimitOpen"
            type="number"
            dense
            outlined
            debounce="700"
            @input="atualizarConfiguracao('TicketsLimitOpen')"
            style="width: 300px"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Cantidad de tickets cerrados que se cargará en la pantalla de atención.</q-item-label>
            <q-item-label caption>Inserte aquí la cantidad de tickets que se cargará en la pantalla de atención...</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-input
              v-model="TicketsLimitClosed"
              type="number"
              dense
              outlined
              debounce="700"
              @input="atualizarConfiguracao('TicketsLimitClosed')"
              style="width: 300px"
            />
        </q-item-section>
      </q-item>

    </q-list>

<q-separator spaced />
  </div>
</template>

<script>
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarConfiguracoes, AlterarConfiguracao } from 'src/service/configuracoes'
export default {
  name: 'IndexConfiguracoes',
  data() {
    return {
      userProfile: 'user',
      tempoOptions: [
        { value: '10', label: '10 minutos' },
        { value: '60', label: '1 hora' },
        { value: '1440', label: '1 día' },
        { value: '7200', label: '5 días' },
        { value: '14400', label: '10 días' }
      ],
      configuracoes: [],
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      ContactAdmin: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      userContactWallet: null,
      rejectCalls: null,
      userDisableSignature: null,
      sendGreetingAccepted: null,
      sendMsgTransfTicket: null,
      spyticket: null,
      userReopenTicket: null,
      universalCounter: null,
      autoClose: null,
      autoCloseTime: null,
      autoCloseMessage: '',
      chatbotLane: null,
      callRejectMessage: '',
      autoPendingTime: null,
      autoPending: null,
      hidetab: null,
      maxRetriesBusinessHours: null,
      TicketsLimitOpen: null,
      TicketsLimitClosed: null
    }
  },
  methods: {
    resetarFluxoAtivo() {
      this.botTicketActive = ''
      this.atualizarConfiguracao('botTicketActive')
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
    },
    async listarChatFlow() {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async atualizarConfiguracao(key) {
      if (key === 'autoCloseTime') {
        const params = { key, value: this.$data[key].value }
        try {
          await AlterarConfiguracao(params)
          this.$q.notify({
            type: 'positive',
            message: 'Configuración modificada!',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
          })
        } catch (error) {
          console.error('error - AlterarConfiguracao', error)
          this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
          this.$notificarErro('¡Ocurrió un error!', error)
        }
      } else {
        const params = { key, value: this.$data[key] }
        try {
          await AlterarConfiguracao(params)
          this.$q.notify({
            type: 'positive',
            message: 'Configuración modificada!',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
          })
        } catch (error) {
          console.error('error - AlterarConfiguracao', error)
          this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
          this.$notificarErro('¡Ocurrió un error!', error)
        }
      }
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile')
    await this.listarConfiguracoes()
    await this.listarChatFlow()
  }
}
</script>

<style lang="scss" scoped></style>