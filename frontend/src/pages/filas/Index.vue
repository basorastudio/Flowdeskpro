<template>
  <div v-if="userProfile === 'admin'">
    <q-table flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="filas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-left>
        <div>
          <h2  :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-arrow-decision-outline q-pr-sm" />
            Filas
          </h2>
          <q-btn class="generate-button btn-rounded-50"
          icon="eva-plus-outline"
          label="Adicionar"
          @click="filaEdicao = {}; modalFila = true" />
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
          <q-icon size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'" />
        </q-td>
      </template>

      <template v-slot:body-cell-from_ia="props">
        <q-td class="text-center">
          <q-icon size="24px"
            :name="props.row.from_ia ? 'mdi-brain' : 'mdi-brain-off'"
            :color="props.row.from_ia ? 'positive' : 'negative'" />
        </q-td>
      </template>

      <template v-slot:body-cell-integrationId="props">
        <q-td :props="props">
          {{ formatIntegracao(props.row.integrationId) }}
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
            :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-edit-outline"
            @click="editarFila(props.row)" />
          <q-btn flat
            round
            :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-trash-outline"
            @click="deletarFila(props.row)" />
        </q-td>
      </template>
    </q-table>

    <ModalFila :modalFila.sync="modalFila"
      :filaEdicao.sync="filaEdicao"
      @modal-fila:criada="filaCriada"
      @modal-fila:editada="filaEditada" />
  </div>
</template>

<script>
import { ListarIntegracoes } from 'src/service/integracoes'
import { DeletarFila, ListarFilas } from 'src/service/filas'
import ModalFila from './ModalFila'
export default {
  name: 'Filas',
  components: {
    ModalFila
  },
  data () {
    return {
      userProfile: 'user',
      filaEdicao: {},
      modalFila: false,
      filas: [],
      integracoes: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'queue', label: 'Fila', field: 'queue', align: 'left' },
        { name: 'color', label: 'Color', field: 'color', align: 'center' },
        { name: 'isActive', label: 'Activo', field: 'isActive', align: 'center' },
        { name: 'integrationId', label: 'Integración', field: 'integrationId', align: 'center', format: (val) => this.formatIntegracao(val) },
        { name: 'from_ia', label: 'Flujo IA', field: 'from_ia', align: 'center' }, // Nueva columna para from_ia
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarIntegracoes () {
      const { data } = await ListarIntegracoes()
      this.integracoes = data
    },
    formatIntegracao(integracaoId) {
      const integracao = this.integracoes.find(integracao => integracao.id === integracaoId)
      return integracao ? integracao.name : ''
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    filaCriada (fila) {
      const newFilas = [...this.filas]
      newFilas.push(fila)
      this.filas = [...newFilas]
    },
    filaEditada (fila) {
      const newFilas = [...this.filas]
      const idx = newFilas.findIndex(f => f.id === fila.id)
      if (idx > -1) {
        newFilas[idx] = fila
      }
      this.filas = [...newFilas]
    },
    editarFila (fila) {
      this.filaEdicao = { ...fila }
      this.modalFila = true
    },
    deletarFila (fila) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Realmente quieres eliminar la fila "${fila.queue}"?`,
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Si',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarFila(fila)
          .then(res => {
            let newFilas = [...this.filas]
            newFilas = newFilas.filter(f => f.id !== fila.id)

            this.filas = [...newFilas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Fila ${fila.queue} eliminada!`,
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
  mounted () {
    this.listarIntegracoes()
    this.listarFilas()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
