<template>
  <q-dialog persistent :value="modalPlano" @hide="fecharModal" @show="abrirModal">
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
        <div class="text-h6 text-center font-family-main">{{ planoEdicao.id ? 'Editar' : 'Crear' }} Plan</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Información
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
            <c-input rounded outlined v-model="plano.name" label="Nombre del plan" />
          </div>
          <div class="full-width">
            <c-input rounded outlined v-model="plano.maxUsers" type="number" label="Máx. Usuarios" />
          </div>
          <div class="full-width">
            <c-input rounded outlined v-model="plano.maxConnections" type="number" label="Máx. Conexiones" />
          </div>
          <div class="full-width">
            <c-input rounded outlined v-model="plano.value" type="number" label="Valor" />
          </div>
          <div class="full-width">
        <q-checkbox
          v-model="plano.isPublic"
          label="Público"
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
          label="Salvar"
          class="q-px-md btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handlePlano"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { AlterarPlano, CriarPlano } from '../../../service/plans'
export default {
  name: 'ModalPlano',
  props: {
    modalPlano: {
      type: Boolean,
      default: false
    },
    planoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data() {
    return {
      plano: {
        id: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        value: null,
        isPublic: true
      }
    }
  },
  methods: {
    resetarPlano() {
      this.plano = {
        id: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        value: null,
        isPublic: true
      }
    },
    fecharModal() {
      this.resetarPlano()
      this.$emit('update:planoEdicao', { id: null })
      this.$emit('update:modalPlano', false)
    },
    abrirModal() {
      if (this.planoEdicao.id) {
        this.plano = { ...this.planoEdicao }
      } else {
        this.resetarPlano()
      }
    },
    async handlePlano() {
      try {
        this.loading = true
        if (this.plano.id) {
          const { data } = await AlterarPlano(this.plano)
          this.$emit('modal-plano:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Plan editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarPlano(this.plano)
          this.$emit('modal-plano:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Plan creado!',
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
