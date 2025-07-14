<template>
  <div v-if="userProfile === 'admin'">
    <q-table flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="integracoes"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :rows-per-page-options="[0]">
      <template v-slot:top-left>
        <div>
          <h2  :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-hub-outline q-pr-sm" />
            Integraciones
          </h2>
          <q-btn class="generate-button btn-rounded-50"
          icon="eva-plus-outline"
          label="Agregar"
          @click="integracaoEdicao = {}; modalIntegracao = true" />
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
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-edit-outline"
            @click="editarIntegracao(props.row)" />
          <q-btn flat
            round
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-trash-outline"
            @click="deletarIntegracao(props.row)" />
        </q-td>
      </template>
    </q-table>
    <ModalIntegracao :modalIntegracao.sync="modalIntegracao"
      :integracaoEdicao.sync="integracaoEdicao"
      @modal-integracao:criada="integracaoCriada"
      @modal-integracao:editada="integracaoEditada" />
  </div>
</template>

<script>
import { DeletarIntegracao, ListarIntegracoes } from 'src/service/integracoes'
import ModalIntegracao from './ModalIntegracao'
export default {
  name: 'Integraciones',
  components: {
    ModalIntegracao
  },
  data () {
    return {
      userProfile: 'user',
      integracaoEdicao: {},
      modalIntegracao: false,
      integracoes: [],
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
        { name: 'type', label: 'Tipo', field: 'type', align: 'left' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarIntegracoes () {
      const { data } = await ListarIntegracoes()
      this.integracoes = data
    },
    integracaoCriada (integracao) {
      const newIntegracaos = [...this.integracoes]
      newIntegracaos.push(integracao)
      this.integracoes = [...newIntegracaos]
    },
    integracaoEditada (integracao) {
      const newIntegracaos = [...this.integracoes]
      const idx = newIntegracaos.findIndex(f => f.id === integracao.id)
      if (idx > -1) {
        newIntegracaos[idx] = integracao
      }
      this.integracoes = [...newIntegracaos]
    },
    editarIntegracao (integracao) {
      this.integracaoEdicao = { ...integracao }
      this.modalIntegracao = true
    },
    deletarIntegracao (integracao) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `¿Desea realmente eliminar la Integración "${integracao.name}"?`,
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
        DeletarIntegracao(integracao)
          .then(res => {
            let newIntegracaos = [...this.integracoes]
            newIntegracaos = newIntegracaos.filter(f => f.id !== integracao.id)

            this.integracoes = [...newIntegracaos]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Integración ${integracao.name} eliminada!`,
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
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
