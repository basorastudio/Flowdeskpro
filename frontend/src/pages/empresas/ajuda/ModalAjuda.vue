<template>
  <q-dialog persistent :value="modalAjuda" @hide="fecharModal" @show="abrirModal">
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
        <div class="text-h6 text-center font-family-main">{{ ajudaEdicao.id ? 'Editar' : 'Crear' }} Ayuda</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Información
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
            <c-input rounded outlined v-model="ajuda.title" label="Título" />
          </div>
          <div class="full-width">
            <c-input rounded outlined v-model="ajuda.description" label="Descripción" />
          </div>
          <div class="full-width">
            <c-input rounded outlined v-model="ajuda.video" label="Código de video" />
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
          label="Salvar"
          class="q-px-md btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handleAjuda"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { UpdateHelp, CriarHelp } from '../../../service/help'
export default {
  name: 'ModalAjuda',
  props: {
    modalAjuda: {
      type: Boolean,
      default: false
    },
    ajudaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data() {
    return {
      ajuda: {
        id: null,
        title: null,
        description: null,
        video: null
      }
    }
  },
  methods: {
    resetarAjuda() {
      this.ajuda = {
        id: null,
        title: null,
        description: null,
        video: null
      }
    },
    fecharModal() {
      this.resetarAjuda()
      this.$emit('update:ajudaEdicao', { id: null })
      this.$emit('update:modalAjuda', false)
    },
    abrirModal() {
      if (this.ajudaEdicao.id) {
        this.ajuda = { ...this.ajudaEdicao }
      } else {
        this.resetarAjuda()
      }
    },
    async handleAjuda() {
      try {
        this.loading = true
        if (this.ajuda.id) {
          const { data } = await UpdateHelp(this.ajuda.id, this.ajuda)
          this.$emit('modal-ajuda:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Ayuda editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarHelp(this.ajuda)
          this.$emit('modal-ajuda:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Ayuda creada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('¡Se produjo un error!', error)
      }
    }
  }

}
</script>

<style lang="scss" scoped></style>
