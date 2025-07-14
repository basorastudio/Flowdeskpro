<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      title="Mensaje de despedida"
      :data="despedidas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <div style="display: flex; flex-direction: column; gap: 1vh">
          <h2  :class="$q.dark.isActive ? ('text-white') : ''">
            <q-icon name="mdi-message-bulleted-off q-pr-sm" />
            Mensaje de despedida
          </h2>

          <div class="row flex-gap-1">
            <q-input
              class="contact-search"
              :class="{
        'order-last q-mt-md': $q.screen.width < 500
      }"
              style="width: 300px"
              filled
              dense
              debounce="500"
              v-model="filter"
              clearable
              placeholder="Buscar"
              @input="filtrarDespedidas"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              class="generate-button btn-rounded-50"
              icon="eva-plus-outline"
              label="Agregar"
              @click="despedidaEdicao = {}; modalDespedida = true"
              style="margin-bottom: 15px;margin-right: 5px;"
            />
          </div>
        </div>

      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            :class="$q.dark.isActive ? ('text-white') : ''"
            icon="eva-edit-outline"
            @click="editarDespedida(props.row)"
          />
          <q-btn
            flat
            round
            :class="$q.dark.isActive ? ('text-white') : ''"
            icon="eva-trash-outline"
            @click="deletarDespedida(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalDespedida
      :modalDespedida.sync="modalDespedida"
      :despedidaEdicao.sync="despedidaEdicao"
      @modal-despedida:criada="despedidaCriada"
      @modal-despedida:editada="despedidaEditada"
    />
  </div>
</template>

<script>
import { DeletarDespedida, ListarDespedidasAll } from 'src/service/despedida'
import ModalDespedida from './ModalDespedida'
import { ListarUsuarios } from 'src/service/user'

export default {
  name: 'Despedidas',
  components: {
    ModalDespedida
  },
  data() {
    return {
      params: {
        searchParam: null,
        userId: null // Agrega el userId
      },
      filter: null,
      despedidaEdicao: {},
      usuarios: [],
      grupos: [],
      modalDespedida: false,
      despedidas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'message', label: 'Mensaje', field: 'message', align: 'left' },
        { name: 'usuerId', label: 'Usuario', field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'createdAt', label: 'Fecha', field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarUsuarios() {
      const data = await ListarUsuarios()
      this.usuarios = data.data.users
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId)
      return user ? user.name : 'Usuario no encontrado'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    },
    filtrarDespedidas(data) {
      this.despedidas = []
      this.params.searchParam = data
      this.loading = true
      this.listarDespedidasFiltro()
      this.loading = false
    },
    async listarDespedidasFiltro() {
      this.loading = true
      const response = await ListarDespedidasAll(this.params) // Pasa params con userId
      const despedidas = response.data
      try {
        const searchTerm = this.params.searchParam.toLowerCase()
        const despedidasFiltradas = despedidas.filter(despedida => {
          const despedidaString = JSON.stringify(despedida).toLowerCase()
          return despedidaString.includes(searchTerm)
        })
        this.LOAD_DESPEDIDAS(despedidasFiltradas)
      } catch (e) {
        this.despedidas = response.data.farewellMessages
      }
      this.loading = false
    },
    LOAD_DESPEDIDAS(despedidasFiltradas) {
      this.despedidas = despedidasFiltradas
    },
    async listarDespedidas() {
      // Obtiene el userId del localStorage o autenticación
      this.params.userId = localStorage.getItem('userId') // Asegúrate de que el userId sea correcto
      const { data } = await ListarDespedidasAll(this.params) // Pasa userId como parámetro
      this.despedidas = data.farewellMessages
    },
    despedidaCriada(despedida) {
      const newDespedidas = [...this.despedidas]
      newDespedidas.push(despedida)
      this.despedidas = [...newDespedidas]
    },
    despedidaEditada(despedida) {
      const newDespedidas = [...this.despedidas]
      const idx = newDespedidas.findIndex(f => f.id === despedida.id)
      if (idx > -1) {
        newDespedidas[idx] = despedida
      }
      this.despedidas = [...newDespedidas]
    },
    editarDespedida(despedida) {
      this.despedidaEdicao = { ...despedida }
      this.modalDespedida = true
    },
    deletarDespedida(despedida) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `¿Deseas realmente eliminar la Despedida "${despedida.id}"?`,
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarDespedida(despedida)
          .then(res => {
            let newDespedidas = [...this.despedidas]
            newDespedidas = newDespedidas.filter(f => f.id !== despedida.id)

            this.despedidas = [...newDespedidas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Despedida ${despedida.id} eliminada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }
  },
  mounted() {
    this.listarDespedidas()
    this.listarUsuarios()
  }
}
</script>

<style lang="scss" scoped>
</style>
