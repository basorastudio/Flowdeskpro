<template>
  <div>
    <q-table flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="ajudas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-left>
        <div>
          <h2  :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-help q-pr-sm" />
            Ayuda
          </h2>
          <q-btn class="generate-button btn-rounded-50"
          icon="eva-plus-outline"
          label="Adicionar"
          @click="ajudaEdicao = {}; modalAjuda = true" />
        </div>
      </template>
              <template v-slot:body-cell-acoes="props">
                <q-td class="text-center">
                  <q-btn flat round icon="eva-edit-outline" @click="editarAjuda(props.row)" />
                  <q-btn flat round icon="eva-trash-outline" @click="deletarAjuda(props.row)" />
                </q-td>
              </template>
            </q-table>
            <ModalAjuda :modalAjuda.sync="modalAjuda" :ajudaEdicao.sync="ajudaEdicao" @modal-ajuda:criada="ajudaCriada"
            @modal-ajuda:editada="ajudaEditada" />
  </div>
</template>

<script>
import { ListarHelpList, DeleteHelp } from '../../../service/help'
import ModalAjuda from './ModalAjuda'
export default {
  name: 'Ajudas',
  components: {
    ModalAjuda
  },
  data() {
    return {
      tab: 'ajuda',
      ajudaEdicao: {},
      modalAjuda: false,
      ajudas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'title', label: 'Título', field: 'title', align: 'left' },
        { name: 'description', label: 'Descripción', field: 'description', align: 'center' },
        { name: 'video', label: 'Video', field: 'video', align: 'center' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarAjuda() {
      const { data } = await ListarHelpList()
      this.ajudas = data
    },
    editarAjuda(ajuda) {
      this.ajudaEdicao = { ...ajuda }
      this.modalAjuda = true
    },
    ajudaCriada(ajuda) {
      const newAjuda = [...this.ajudas]
      newAjuda.push(ajuda)
      this.ajudas = [...newAjuda]
    },
    ajudaEditada(ajuda) {
      const newAjuda = [...this.ajudas]
      const idx = newAjuda.findIndex(f => f.id === ajuda.id)
      if (idx > -1) {
        newAjuda[idx] = ajuda
      }
      this.ajudas = [...newAjuda]
    },
    deletarAjuda(ajuda) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Realmente deseas eliminar la Ayuda "${ajuda.title}"?`,
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
        DeleteHelp(ajuda.id) // Aqui passamos apenas o ID
          .then(res => {
            let newAjuda = [...this.ajudas]
            newAjuda = newAjuda.filter(f => f.id !== ajuda.id)

            this.ajudas = [...newAjuda]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Ayuda ${ajuda.title} eliminada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            this.$q.notify({
              type: 'negative',
              progress: true,
              position: 'top',
              message: `Error al eliminar la ayuda: ${error.message}`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  },
  mounted() {
    this.listarAjuda()
  }
}
</script>

<style lang="scss" scoped></style>
