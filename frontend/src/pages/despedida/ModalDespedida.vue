<template>
  <q-dialog
    persistent
    :value="modalDespedida"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-lg modal-container container-rounded-10"
    >
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          color="negative"
          v-close-popup
          flat
          icon="eva-close"
        />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 text-center font-family-main">{{ despedidaEdicao.id ? 'Editar': 'Crear' }} Despedida</div>
      </q-card-section>
      <q-card-section class="q-pa-lg container-border container-rounded-10">
        <div class="text-h6 font-family-main q-mb-md">
          Despedida
        </div>
        <q-input
          class="row col"
          rounded
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="despedida.message"
          label="Despedida"
          autogrow
        />
        <div class="full-width" v-if="userProfile === 'admin'">
          <q-checkbox
            v-model="despedida.global"
            label="Mostrar para todos"
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md btn-rounded-50"
        />
        <q-btn
          label="Guardar"
          class="generate-button btn-rounded-50"
          icon="eva-save-outline"
          @click="handleDespedida"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { CriarDespedida, AlterarDespedida } from 'src/service/despedida'

export default {
  name: 'ModalDespedida',
  props: {
    modalDespedida: {
      type: Boolean,
      default: false
    },
    despedidaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      userProfile: 'user',
      despedida: {
        id: null
      }
    }
  },
  methods: {
    resetarDespedida () {
      this.despedida = {
        id: null
      }
    },
    fecharModal () {
      this.resetarDespedida()
      this.$emit('update:despedidaEdicao', { id: null })
      this.$emit('update:modalDespedida', false)
    },
    abrirModal () {
      if (this.despedidaEdicao.id) {
        this.despedida = { ...this.despedidaEdicao }
      } else {
        this.resetarDespedida()
      }
    },
    async handleDespedida () {
      try {
        this.loading = true
        if (this.despedida.id) {
          const { data } = await AlterarDespedida(this.despedida)
          this.$emit('modal-despedida:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Despedida editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarDespedida(this.despedida)
          this.$emit('modal-despedida:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Despedida creada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
        // setTimeout(() => {
        //   window.location.reload();
        // }, 300);
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocurrió un error al crear la despedida', error)
      }
    }
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
