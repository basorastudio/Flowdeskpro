<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      class="contact-table my-sticky-dynamic container-rounded-10"
      title="Protocolos"
      :data="protocolos"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
    >
      <template v-slot:top-left>
        <div>
          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-timeline-text-outline"/>
            Protocolos
          </h2>
          <q-input
            :class="{
              'order-last q-mt-md': $q.screen.width < 500
            }"
            class="contact-search"
            style="width: 300px"
            filled
            dense
            debounce="500"
            v-model="filter"
            clearable
            placeholder="Localize"
            @input="filtrarProtocolos"
          >
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <a :href="getTicketUrl(props.row.id)">{{ props.row.id }}</a>
        </q-td>
      </template>
      <template v-slot:body-cell-contactId="props">
        <q-td :props="props">
          {{ props.row.contactName || 'Cargando...' }}
        </q-td>
      </template>
      <template v-slot:body-cell-userId="props">
        <q-td :props="props">
          {{ formatUser(props.row.userId) }}
        </q-td>
      </template>
      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          {{ formatDate(props.row.createdAt) }}
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ protocolos.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
  </div>
</template>

<script>
import { ListarProtocolos } from 'src/service/protocolos'
import { ListarUsuarios } from 'src/service/user'
import { ObterContato } from 'src/service/contatos'

export default {
  name: 'Protocolos',
  data() {
    return {
      userProfile: 'user',
      filter: null,
      contatosCache: {},
      usuarios: [],
      protocolos: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'id', label: 'Ticket', field: 'id', align: 'left' },
        { name: 'protocol', label: 'Protocolo', field: 'protocol', align: 'left' },
        { name: 'contactId', label: 'Contacto', field: 'contactId', align: 'center', format: (val) => this.formatContact(val), sortable: false },
        { name: 'userId', label: 'Usuario', field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'createdAt', label: 'Fecha', field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) }
      ]
    }
  },
  methods: {
    async listarUsuarios() {
      const data = await ListarUsuarios()
      this.usuarios = data.data.users
    },
    async listarProtocolos() {
      this.loading = true
      try {
        const response = await ListarProtocolos({
          searchParam: this.filter,
          pageNumber: this.params.pageNumber,
          tenantId: localStorage.getItem('tenantId')
        })

        if (response.data && Array.isArray(response.data.protocols)) {
          this.protocolos = [
            ...this.protocolos,
            ...(await Promise.all(
              response.data.protocols.map(async (protocolo) => {
                protocolo.contactName = await this.getContactName(protocolo.contactId)
                return protocolo
              })
            ))
          ]
          this.pagination.rowsNumber = response.data.count || 0
          this.pagination.hasMore = response.data.hasMore
        } else {
          console.error('La respuesta de la API no está en el formato esperado:', response.data)
        }
      } catch (error) {
        console.error('Error al enumerar los protocolos:', error)
      } finally {
        this.loading = false
      }
    },
    async getContactName(contactId) {
      if (this.contatosCache[contactId]) {
        return this.contatosCache[contactId].name
      }
      try {
        const response = await ObterContato(contactId)
        const contact = response.data
        this.contatosCache[contactId] = contact
        return contact.name
      } catch (error) {
        console.error('Error en busca de contacto:', error)
        return 'Contacto no encontrado'
      }
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId)
      return user ? user.name : 'Usuario no encontrado'
    },
    getTicketUrl(ticketId) {
      const route = this.$router.resolve({ path: `/atendimento/${ticketId}` })
      return route.href
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    },
    async filtrarProtocolos() {
      this.params.pageNumber = 1
      this.params.hasMore = true // Garantir que há mais dados a serem carregados
      this.protocolos = [] // Limpar protocolos atuais para aplicar o novo filtro
      await this.listarProtocolos()
    },
    onScroll({ to, ref, ...all }) {
      if (!this.loading && this.params.hasMore && to >= (this.protocolos.length - 10)) {
        this.loading = true
        this.params.pageNumber++
        this.listarProtocolos()
      }
    }
  },
  async mounted() {
    await this.listarProtocolos()
    await this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="sass" >
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px

.blur-effect
  filter: blur(0px)
</style>
