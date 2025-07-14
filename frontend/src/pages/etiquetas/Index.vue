<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="etiquetas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <div>
          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
          <q-icon name="mdi-tag-outline" ></q-icon>
          Etiquetas
        </h2>
        <q-btn
          class="generate-button btn-rounded-50"
          icon="eva-plus-outline"
          label="Adicionar"
          @click="etiquetaEdicao = {}; modalEtiqueta = true"
        />
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
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-edit-outline"
            @click="editarEtiqueta(props.row)"
          />
          <q-btn
            flat
            round
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-trash-outline"
            @click="deletarEtiqueta(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalEtiqueta
      :modalEtiqueta.sync="modalEtiqueta"
      :etiquetaEdicao.sync="etiquetaEdicao"
      @modal-etiqueta:criada="etiquetaCriada"
      @modal-etiqueta:editada="etiquetaEditada"
    />
  </div>
</template>

<script>
import { DeletarEtiqueta, ListarEtiquetas } from 'src/service/etiquetas'
import ModalEtiqueta from './ModalEtiqueta'
export default {
  name: 'Etiquetas',
  components: {
    ModalEtiqueta
  },
  data () {
    return {
      userProfile: 'user',
      etiquetaEdicao: {},
      modalEtiqueta: false,
      etiquetas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'tag', label: 'Etiqueta', field: 'tag', align: 'left' },
        { name: 'color', label: 'Color', field: 'color', align: 'center' },
        { name: 'isActive', label: 'Activo', field: 'isActive', align: 'center' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas()
      this.etiquetas = data
    },
    etiquetaCriada (etiqueta) {
      const newEtiquetas = [...this.etiquetas]
      newEtiquetas.push(etiqueta)
      this.etiquetas = [...newEtiquetas]
    },
    etiquetaEditada (etiqueta) {
      const newEtiquetas = [...this.etiquetas]
      const idx = newEtiquetas.findIndex(f => f.id === etiqueta.id)
      if (idx > -1) {
        newEtiquetas[idx] = etiqueta
      }
      this.etiquetas = [...newEtiquetas]
    },
    editarEtiqueta (etiqueta) {
      this.etiquetaEdicao = { ...etiqueta }
      this.modalEtiqueta = true
    },
    deletarEtiqueta (etiqueta) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Realmente quieres eliminar la etiqueta "${etiqueta.tag}"?`,
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
        DeletarEtiqueta(etiqueta)
          .then(res => {
            let newEtiquetas = [...this.etiquetas]
            newEtiquetas = newEtiquetas.filter(f => f.id !== etiqueta.id)

            this.etiquetas = [...newEtiquetas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Etiqueta ${etiqueta.tag} eliminada!`,
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
    this.listarEtiquetas()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
