<template>
  <div class="mass-container container-rounded-10" v-if="userProfile === 'admin'">
    <div class="col q-pa-md items-center">
      <h2 :class="{ 'text-green': $q.dark.isActive }">
        <q-icon name="mdi-view-dashboard-variant" />
        Panel de Atenciones
      </h2>
      <div class="q-mb-md row flex-gap-1">
        <q-btn
          icon="mdi-filter"
          label="Filtros"
          class="generate-button btn-rounded-50"
          :class="{'generate-button-dark': $q.dark.isActive}"
          @click="visualizarFiltros = true" />
        <!-- <q-btn @click="listarUsuarios2"
            flat
            color="primary"
            class="bg-padrao btn-rounded"
            style="margin-right: 10px;">
          <q-icon name="mdi-transfer" />
          <q-tooltip content-class="bg-primary text-bold">
            Transferir Atención entre Usuarios
          </q-tooltip>
        </q-btn> -->
        <q-btn @click="fecharTicketsEmMassa"
            flat
            icon="mdi-close"
            label="Cierre de tickets en masa"
            class="generate-button btn-rounded-50"
            :class="{'generate-button-dark' : $q.dark.isActive}">

          <q-tooltip content-class="text-bold">
            Cierre de tickets en masa
          </q-tooltip>
        </q-btn>

        <q-btn @click="apagarTicketsMassa"
            flat
            icon="mdi-close"
            label="Eliminar tickets en masa"
            class="generate-button btn-rounded-50"
            :class="{'generate-button-dark' : $q.dark.isActive}">

          <q-tooltip content-class="text-bold">
            Eliminar tickets en masa
          </q-tooltip>
        </q-btn>

      </div>
    </div>

    <q-dialog full-height
      position="left"
      v-model="visualizarFiltros">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Filtros</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <DatePick  dense rounded outlined
            class="row col"
            v-model="pesquisaTickets.dateStart" />
          <DatePick  dense rounded outlined
            class="row col"
            v-model="pesquisaTickets.dateEnd" />
          <q-separator v-if="profile === 'admin'" />
          <q-toggle v-if="profile === 'admin'"
            class="q-ml-lg"
            v-model="pesquisaTickets.showAll"
            label="(Admin) - Ver Todos" />
          <q-separator class="q-mb-md"
            v-if="profile === 'admin'" />

          <q-select v-if="!pesquisaTickets.showAll"
            square
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            multiple
            options-dense
            use-chips
            label="Filas"
            color="primary"
            v-model="pesquisaTickets.queuesIds"
            :options="filas"
            :input-debounce="700"
            option-value="id"
            option-label="queue"
            input-style="width: 280px; max-width: 280px;" />
          <!-- @input="debounce(BuscarTicketFiltro(), 700)" -->
        </q-card-section>
        <q-card-section>
          <q-separator />
          <div class="text-h6 q-mt-md">Tipo de visualización</div>
          <q-option-group :options="optionsVisao"
            label="Visión"
            type="radio"
            v-model="visao" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline
            label="Actualizar"
            color="primary"
            v-close-popup
            @click="consultarTickets" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div
      class="scroll">
      <template v-for="(items, key) in sets">
        <div
          :key="key"
          class="row q-pa-md q-col-gutter-md q-mb-sm">
          <div :class="contentClass"
            v-for="(item, index) in items"
            :key="index">
            <q-card class="container-border container-rounded-50"
              flat>
              <q-item v-if="visao === 'U' || visao === 'US'"
                class="font-family-main text-bold"
                :class="{
                  'bg-negative text-white': definirNomeUsuario(item[0]) === 'Pendiente'
                }">
                <!-- <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                  </q-avatar>
                </q-item-section> -->
                <q-item-section>
                  <q-item-label class="font-family-main text-bold text-h6">{{ definirNomeUsuario(item[0]) }}</q-item-label>
                  <q-item-label caption class="font-family-main"
                    :class="{
                      'text-white': definirNomeUsuario(item[0]) === 'Pendiente'
                    }">
                    Atenciones: {{ item.length }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="visao === 'F' || visao === 'FS'"
                class="font-family-main text-bold"
                :class="{
                  'bg-negative text-white': definirNomeFila(item[0]) === 'Sin Fila'
                }">
                <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ definirNomeFila(item[0]) }}</q-item-label>
                  <q-item-label caption
                    :class="{
                      'text-white': definirNomeFila(item[0]) === 'Sin Fila'
                    }">
                    Abiertos: {{ counterStatus(item).open }} | Pendientes: {{ counterStatus(item).pending }} | Total: {{
                        item.length
                    }}
                  </q-item-label>
                </q-item-section>
                <q-btn @click="listarFilas"
                  v-if="definirNomeFila(item[0]).toLowerCase() === 'sin fila'"
                  flat
                  color="primary"
                  class="bg-padrao btn-rounded">
                  <q-icon name="mdi-transfer" />
                  <q-tooltip content-class="bg-primary text-bold">
                    Transferir Atenciones Sin Fila
                  </q-tooltip>
                </q-btn>
              </q-item>
              <q-separator />
              <q-card-section :style="{ height: '320px' }"
                class="bg-grey-3 scroll"

                v-if="visao === 'U' || visao === 'F'">
                <ItemTicket v-for="(ticket, i) in item"
                  :key="i"
                  :ticket="ticket"
                  :filas="filas" />
              </q-card-section>
            </q-card>
          </div>
          <q-resize-observer @resize="onResize"></q-resize-observer>
        </div>
      </template>
    </div>

    <q-dialog v-model="modaFecharMassa"
      @hide="modaFecharMassa = false"
      persistent>
    <q-card class="container-rounded-10 modal-container q-pa-lg">

      <q-card-actions align="right">
        <q-btn
          flat
          color="negative"
          icon="eva-close-outline"
          v-close-popup
        />
      </q-card-actions>

      <q-card-section>
        <div class="text-h6 text-center font-family-main">Cerrar Tickets en Masa</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Atención, esta es una acción masiva y no se puede revertir.
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
          <DatePick dense rounded outlined label="Fecha Inicial de creación del ticket"
            class="row col"
            v-model="fecharTickets.dateStart" />
          </div>
          <div class="full-width">
          <DatePick dense rounded outlined label="Fecha Final de creación del ticket"
            class="row col"
            v-model="fecharTickets.dateEnd" />
          </div>
          <div class="full-width">
            <q-select
              rounded
              outlined
              dense
              v-model="fecharTickets.status"
              :options="optionsTickets"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Estado"
            />
          </div>
          <div class="full-width">
            <q-select
              rounded
              outlined
              dense
              label="Canal"
              v-model="fecharTickets.whatsappId"
              :options="listaWhats"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
            >
          </div>
          <div class="full-width">
        <q-checkbox
          v-model="fecharTickets.isGroup"
          label="Grupo"
        />
          </div>
        </div>
      </q-card-section>
      </div>

      <q-card-actions align="right">
        <q-btn
          label="Cancelar"
          class="q-px-md q-mr-sm btn-rounded-50"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Ejecutar"
          class="q-px-md btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handleFecharMassa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

    <q-dialog v-model="modarApagarMassa"
      @hide="modarApagarMassa = false"
      persistent>
    <q-card class="container-rounded-10 modal-container q-pa-lg">

      <q-card-actions align="right">
        <q-btn
          flat
          color="negative"
          icon="eva-close-outline"
          v-close-popup
        />
      </q-card-actions>

      <q-card-section>
        <div class="text-h6 text-center font-family-main">Eliminar Tickets en Masa</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Atención, esta es una acción masiva y no se puede revertir.
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
          <DatePick dense rounded outlined label="Fecha Inicial de creación del ticket"
            class="row col"
            v-model="apagarTickets.dateStart" />
          </div>
          <div class="full-width">
          <DatePick dense rounded outlined label="Fecha Final de creación del ticket"
            class="row col"
            v-model="apagarTickets.dateEnd" />
          </div>
          <div class="full-width">
            <q-select
              rounded
              outlined
              dense
              v-model="apagarTickets.status"
              :options="optionsTicketsApagar"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Estado"
            />
          </div>
          <div class="full-width">
            <q-select
              rounded
              outlined
              dense
              label="Canal"
              v-model="apagarTickets.whatsappId"
              :options="listaWhats"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
            >
          </div>
          <div class="full-width">
        <q-checkbox
          v-model="apagarTickets.isGroup"
          label="Grupo"
        />
          </div>
        </div>
      </q-card-section>
      </div>

      <q-card-actions align="right">
        <q-btn
          label="Cancelar"
          class="q-px-md q-mr-sm btn-rounded-50"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Ejecutar"
          class="q-px-md btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handleApagarMassa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { socketIO } from 'src/utils/socket'
const socket = socketIO()

import ItemTicket from 'src/pages/atendimento/ItemTicket'
import { ConsultarTicketsQueuesService } from 'src/service/estatisticas.js'
import { ListarFilas } from 'src/service/filas'
import { ListarUsuarios } from 'src/service/user'
import { AtualizarTicket, FecharemMassaTickets, ApagaremMassaTickets } from 'src/service/tickets'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
const UserQueues = localStorage.getItem('queues')
import { groupBy } from 'lodash'
const profile = localStorage.getItem('profile')
import { format, sub } from 'date-fns'
export default {
  name: 'painel-de-controle',
  components: { ItemTicket },
  data () {
    return {
      userProfile: 'admin',
      profile,
      visualizarFiltros: false,
      slide: 0,
      height: 400,
      optionsVisao: [
        { label: 'Por Usuario', value: 'U' },
        { label: 'Por Usuario (Sintético)', value: 'US' },
        { label: 'Por Filas', value: 'F' },
        { label: 'Por Filas (Sintético)', value: 'FS' }
      ],
      visao: 'U',
      pesquisaTickets: {
        showAll: true,
        dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        dateEnd: format(new Date(), 'yyyy-MM-dd'),
        queuesIds: []
      },
      fecharTickets: {
        dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        dateEnd: format(new Date(), 'yyyy-MM-dd'),
        optionsTickets: [
          { value: 'open', label: 'Abierto' },
          { value: 'pending', label: 'Pendiente' }
        ],
        listaWhats: [],
        isGroup: false
      },
      apagarTickets: {
        dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        dateEnd: format(new Date(), 'yyyy-MM-dd'),
        optionsTickets: [
          { value: 'open', label: 'Abierto' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'closed', label: 'Cerrado' }
        ],
        listaWhats: [],
        isGroup: false
      },
      tickets: [],
      optionsTickets: [
        { value: 'open', label: 'Abierto' },
        { value: 'pending', label: 'Pendiente' }
      ],
      optionsTicketsApagar: [
        { value: 'open', label: 'Abierto' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'closed', label: 'Cerrado' }
      ],
      listaWhats: [],
      filas: [],
      usuarios: [],
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      usuarios2: [],
      usuarios3: [],
      modalTransferirTicket2: false,
      modaFecharMassa: false,
      modarApagarMassa: false,
      usuarioSelecionado2: null,
      usuarioSelecionado3: null,
      sizes: { lg: 3, md: 3, sm: 2, xs: 1 }
    }
  },
  computed: {
    contentClass () {
      let contentClass = 'col'
      const keysLenSize = Object.keys(this.cTicketsUser[0]).length
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        if (this.sizes[size]) {
          const sizeExpect = this.sizes[size] > keysLenSize ? keysLenSize : this.sizes[size]
          contentClass += ' col-' + size + '-' + (12 / sizeExpect)
        }
      }
      return contentClass
    },
    sets () {
      const sets = []
      // const items = this.itemsPerSet
      const limit = Math.ceil(this.cTicketsUser.length / this.itemsPerSet)
      for (let index = 0; index < limit; index++) {
        const start = index * this.itemsPerSet
        const end = start + this.itemsPerSet
        sets.push(this.cTicketsUser.slice(start, end))
      }
      return sets[0]
    },
    itemsPerSet () {
      let cond = false
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        cond = cond || this.$q.screen[size]
        if (cond && this.sizes[size]) {
          return this.sizes[size]
        }
      }
      return 1
    },
    cUserQueues () {
      try {
        const filasUsuario = JSON.parse(UserQueues).map(q => {
          if (q.isActive) {
            return q.id
          }
        })
        return this.filas.filter(f => filasUsuario.includes(f.id)) || []
      } catch (error) {
        return []
      }
    },
    cTicketsUser () {
      const field = this.visao === 'U' || this.visao === 'US' ? 'userId' : 'queueId'
      return [groupBy(this.tickets, field)]
    }
  },
  methods: {
    async handleApagarMassa() {
      try {
        const data = {
          status: this.apagarTickets.status,
          startDate: this.apagarTickets.dateStart,
          endDate: this.apagarTickets.dateEnd,
          whatsappId: this.apagarTickets.whatsappId,
          isGroup: this.apagarTickets.isGroup
        }

        const response = await ApagaremMassaTickets(data)

        if (response.status === 200) {
          this.$q.notify({
            type: 'positive',
            message: '¡Tickets eliminados con éxito!'
          })
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Ocurrió un error al eliminar los tickets.'
          })
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }

        this.modaFecharMassa = false
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Ocurrió un error al eliminar los tickets.'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    },
    async handleFecharMassa() {
      try {
        const data = {
          status: this.fecharTickets.status,
          startDate: this.fecharTickets.dateStart,
          endDate: this.fecharTickets.dateEnd,
          whatsappId: this.fecharTickets.whatsappId,
          isGroup: this.fecharTickets.isGroup
        }

        const response = await FecharemMassaTickets(data)

        if (response.status === 200) {
          this.$q.notify({
            type: 'positive',
            message: '¡Tickets cerrados con éxito!'
          })
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Ocurrió un error al cerrar los tickets.'
          })
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }

        this.modaFecharMassa = false
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Ocurrió un error al cerrar los tickets.'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    },
    async listaWhatsapp() {
      const { data } = await ListarWhatsapps()
      this.listaWhats = data.filter(f => f.isActive)
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas()
        this.filas = data
        this.modalTransferirTicket = true
        this.listarUsuarios()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar filas', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
        this.modalTransferirTicket = true
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    async atualizarTicketPorFila (id, user, fila, status) {
      await AtualizarTicket(id, {
        userId: user,
        queueId: fila,
        status: status,
        isTransference: 1
      })
    },
    async confirmarTransferenciaTicket () {
      if (this.usuarioSelecionado === null) {
        this.$notificarErro('¡Selecciona el usuario y la fila de destino para las atenciones pendientes!')
        return
      }
      try {
        for (const ticket of this.tickets) {
          if (ticket.queueId === null) {
            await this.atualizarTicketPorFila(ticket.id, this.usuarioSelecionado, this.filaSelecionada, ticket.status)
          }
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al hacer la transferencia', error)
      }
      this.modalTransferirTicket = false
    },
    async listarUsuarios2 () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios2 = data.users
        this.usuarios3 = data.users
        this.modalTransferirTicket2 = true
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    async confirmarTransferenciaTicket2 () {
      if (this.usuarioSelecionado2 === null || this.usuarioSelecionado3 === null) {
        this.$notificarErro('¡Seleccione el usuario de destino!')
        return
      }
      try {
        for (const ticket of this.tickets) {
          if (ticket.userId === this.usuarioSelecionado2) {
            await this.atualizarTicketPorFila(ticket.id, this.usuarioSelecionado3, ticket.queueId, ticket.status)
          }
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al hacer la transferencia', error)
      }
      this.modalTransferirTicket2 = false
    },
    async atualizarTicketPendente (id, user, fila) {
      await AtualizarTicket(id, {
        userId: user,
        queueId: fila,
        status: 'closed',
        isTransference: 1
      })
    },
    async fecharTicketsEmMassa () {
      this.modaFecharMassa = true
    },
    async apagarTicketsMassa () {
      this.modarApagarMassa = true
    },
    async resolverTodosPendentes() {
      try {
        const pendingTickets = this.tickets.filter(ticket => ticket.status === 'pending')

        for (let i = 0; i < pendingTickets.length; i += 10) {
          const batch = pendingTickets.slice(i, i + 10)
          const batchPromises = batch.map(ticket =>
            this.atualizarTicketPendente(ticket.id, ticket.userId, ticket.queueId)
              .catch(e => {
                console.log(ticket.id + ' no actualizado: ' + e)
              })
          )
          this.$q.notify({
            color: 'warning',
            position: 'top',
            message: 'Tickets siendo resueltos en bloques de 10 elementos.'
          })
          await Promise.all(batchPromises)
        }

        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: 'Espere, la página se recargará después de completar la acción.'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cerrar atenciones en masa.', error)
      }
      this.modaFecharMassa = false
    },
    async resolverTodosAbertos() {
      try {
        const openTickets = this.tickets.filter(ticket => ticket.status === 'open')

        for (let i = 0; i < openTickets.length; i += 10) {
          const batch = openTickets.slice(i, i + 10)
          const batchPromises = batch.map(ticket =>
            this.atualizarTicketPendente(ticket.id, ticket.userId, ticket.queueId)
              .catch(e => {
                console.log(ticket.id + ' no actualizado: ' + e)
              })
          )
          this.$q.notify({
            color: 'warning',
            position: 'top',
            message: 'Tickets siendo resueltos en bloques de 10 elementos.'
          })
          await Promise.all(batchPromises)
        }

        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: 'Espere, la página se recargará después de completar la acción.'
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cerrar atenciones en masa.', error)
      }
      this.modarApagarMassa = false
    },
    deleteTicket (ticketId) {
      const newTickets = [...this.tickets]
      const ticketsFilter = newTickets.filter(t => t.id !== ticketId)
      this.tickets = [...ticketsFilter]
    },
    updateTicket (ticket) {
      const newTickets = [...this.tickets]
      const idx = newTickets.findIndex(t => ticket.id)
      if (idx) {
        newTickets[idx] = ticket
        this.tickets = [...newTickets]
      }
    },
    createTicket (ticket) {
      const newTickets = [...this.tickets]
      newTickets.unshift(ticket)
      this.tickets = [...newTickets]
    },
    verifyIsActionSocket (data) {
      if (!data.id) return false

      // mostrar todos
      if (this.pesquisaTickets.showAll) return true

      // no existir filas registradas
      if (!this.filas.length) return true

      // verificar si la fila del ticket está filtrada
      const isQueue = this.pesquisaTickets.queuesIds.indexOf(q => data.queueId === q)

      let isValid = false
      if (isQueue !== -1) {
        isValid = true
      }
      return isValid

      // verificar si el usuario tiene acceso a la fila del ticket
    },
    conectSocketQueues (tenantId, queueId) {
      // socket.on(`${tenantId}:${queueId}:ticket:queue`, data => {
      //   if (!this.verifyIsActionSocket(data.ticket)) return

      //   if (data.action === 'update') {
      //     this.updateTicket(data.ticket)
      //   }
      //   if (data.action === 'create') {
      //     this.createTicket(data.ticket)
      //   }
      //   if (data.action === 'delete') {
      //     this.deleteTicket(data.ticketId)
      //   }
      // })
    },
    socketTickets () {
      socket.on(`${usuario.tenantId}:ticketList`, async (data) => {
        if (data.type === 'ticket:update') {
          if (data.payload.channel !== 'waba') {
            console.log('socket ON: DASH:UPDATE')
            this.$q.notify({
              color: 'positive',
              position: 'bottom',
              message: `Nuevas interacciones para la atención ${data.payload.id} recibidas. Si deseas acceder a la nueva información en este panel, actualiza esta página.`
            })
          }
        }
      })
    },
    connectSocket () {
      this.socketTickets()
      this.cUserQueues.forEach(el => {
        this.conectSocketQueues(usuario.tenantId, el.id)
      })
    },
    definirNomeUsuario (item) {
      this.verifyIsActionSocket(item)
      return item?.user?.name || 'Pendiente'
    },
    definirNomeFila (f) {
      const fila = this.filas.find(fila => fila.id === f.queueId)
      return fila?.queue || 'Sin Fila'
    },
    counterStatus (tickets) {
      const status = {
        open: 0,
        pending: 0,
        closed: 0
      }
      const group = groupBy(tickets, 'status')
      status.open = group.open?.length || 0
      status.pending = group.pending?.length || 0
      status.closed = group.closed?.length || 0
      return status
    },
    consultarTickets () {
      ConsultarTicketsQueuesService(this.pesquisaTickets)
        .then(res => {
          this.tickets = res.data
          this.connectSocket()
        })
        .catch(error => {
          console.error(error)
          this.$notificarErro('Error al consultar atenciones', error)
        })
    },
    onResize ({ height }) {
      this.height = height
    }
  },

  async mounted () {
    if (!localStorage.getItem('reloaded')) {
      localStorage.setItem('reloaded', 'true')
      window.location.reload()
    } else {
      localStorage.removeItem('reloaded')
    }
    await ListarFilas().then(res => {
      this.filas = res.data
    })
    await this.consultarTickets()
    this.listaWhatsapp()
    this.userProfile = localStorage.getItem('profile')
  },
  destroyed () {
    socket.disconnect()
  }
}
</script>

<style lang="scss" scoped>

</style>
