<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      :data="mensagensRapidas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <div>
          <h2  :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-reply-all-outline" />
            Mensajes rápidos
          </h2>
          <q-btn
          class="generate-button btn-rounded-50"
          icon="eva-plus-outline"
          label="Adicionar"
          @click="mensagemRapidaEmEdicao = {}; modalMensagemRapida = true"
        />
        </div>

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
      <template v-slot:body-cell-media="props">
        <q-td :props="props">
          <span v-if="props.row.media">
            <a :href="generateMediaUrl(props.row.media)" target="_blank" style="text-decoration: underline; cursor: pointer;">
              Abrir Archivo
            </a>
          </span>
          <span v-else>
            Sin Archivo
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-edit-outline"
            @click="editarMensagem(props.row)"
          />
          <q-btn
            flat
            round
             :class="$q.dark.isActive ? ('text-green') : ''"
            icon="eva-trash-outline"
            @click="deletarMensagem(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalMensagemRapida
      :modalMensagemRapida.sync="modalMensagemRapida"
      :mensagemRapidaEmEdicao.sync="mensagemRapidaEmEdicao"
      @mensagemRapida:criada="mensagemCriada"
      @mensagemRapida:editada="mensagemEditada"
    />
  </div>
</template>

<script>
import ModalMensagemRapida from './ModalMensagemRapida'
import { ListarMensagensRapidas, DeletarMensagemRapida } from 'src/service/mensagensRapidas'
export default {
  name: 'MensagensRapidas',
  components: { ModalMensagemRapida },
  data () {
    return {
      loading: false,
      mensagensRapidas: [],
      modalMensagemRapida: false,
      mensagemRapidaEmEdicao: {},
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'key', label: 'Clave', field: 'key', align: 'left' },
        { name: 'message', label: 'Mensaje', field: 'message', align: 'left' },
        { name: 'media', label: 'Archivo', field: 'media', align: 'left' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      }
    }
  },
  methods: {
    generateMediaUrl(mediaFileName) {
      return `${process.env.VUE_URL_API}/public/${mediaFileName}`
    },
    async listarMensagensRapidas () {
      const { data } = await ListarMensagensRapidas()
      this.mensagensRapidas = data
    },
    mensagemCriada (mensagem) {
      this.mensagensRapidas.unshift(mensagem)
    },
    mensagemEditada (mensagem) {
      const newMensagens = [...this.mensagensRapidas]
      const idx = newMensagens.findIndex(m => m.id === mensagem.id)
      if (idx > -1) {
        newMensagens[idx] = mensagem
      }
      this.mensagensRapidas = [...newMensagens]
      // console.log(this.mensagensRapidas)
      // console.log('mensagemEditada')
    },
    editarMensagem (mensagem) {
      this.mensagemRapidaEmEdicao = { ...mensagem }
      this.modalMensagemRapida = true
    },
    deletarMensagem (mensagem) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Desea realmente eliminar el mensaje con clave "${mensagem.key}"?`,
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
        DeletarMensagemRapida(mensagem)
          .then(res => {
            let newMensagens = [...this.mensagensRapidas]
            newMensagens = newMensagens.filter(m => m.id !== mensagem.id)

            this.mensagensRapidas = [...newMensagens]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: '¡Mensaje eliminado!',
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
    this.listarMensagensRapidas()
  }
}
</script>

<style lang="scss" scoped>
</style>
