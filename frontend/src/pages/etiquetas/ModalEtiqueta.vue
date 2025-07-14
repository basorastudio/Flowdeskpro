<template>
  <q-dialog
    persistent
    :value="modalEtiqueta"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-lg container-rounded-10 modal-container"
    >
    <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          icon="eva-close"
          color="negative"
          v-close-popup
        />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 font-family-main text-center">{{ etiquetaEdicao.id ? 'Editar': 'Crear' }} Etiqueta</div>
      </q-card-section>
      <q-card-section class="container-rounded-10 container-border q-pa-lg">
        <div class="text-h6 font-family-main q-mb-md">
          Información
        </div>
        <q-input
          class="row col"
          rounded
          outlined
          v-model="etiqueta.tag"
          label="Nombre de la etiqueta"
        />
        <q-input
          filled
          hide-bottom-space
          :style="`background: ${etiqueta.color} `"
          v-model="etiqueta.color"
          :rules="['anyColor']"
          class="q-my-md"
          :dark="false"
          rounded
        >
          <template v-slot:preappend>
          </template>
          <template v-slot:append>
            <q-icon
              name="colorize"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color
                  format-model="hex"
                  rounded
                  default-view="palette"
                  no-header
                  bordered
                  v-model="etiqueta.color"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-checkbox
          v-model="etiqueta.isActive"
          label="Activo"
        />
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
          label="Salvar"
          icon="eva-save-outline"
          class="btn-rounded-50 generate-button"
          @click="handleEtiqueta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { CriarEtiqueta, AlterarEtiqueta } from 'src/service/etiquetas'
export default {
  name: 'ModalEtiqueta',
  props: {
    modalEtiqueta: {
      type: Boolean,
      default: false
    },
    etiquetaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      etiqueta: {
        id: null,
        tag: null,
        color: '#ffffff',
        isActive: true
      }
    }
  },
  methods: {
    resetarEtiqueta () {
      this.etiqueta = {
        id: null,
        tag: null,
        color: '#ffffff',
        isActive: true
      }
    },
    fecharModal () {
      this.resetarEtiqueta()
      this.$emit('update:etiquetaEdicao', { id: null })
      this.$emit('update:modalEtiqueta', false)
    },
    abrirModal () {
      if (this.etiquetaEdicao.id) {
        this.etiqueta = { ...this.etiquetaEdicao }
      } else {
        this.resetarEtiqueta()
      }
    },
    async handleEtiqueta () {
      try {
        this.loading = true
        if (this.etiqueta.id) {
          const { data } = await AlterarEtiqueta(this.etiqueta)
          this.$emit('modal-etiqueta:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Etiqueta editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarEtiqueta(this.etiqueta)
          this.$emit('modal-etiqueta:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Etiqueta creada!',
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
        this.$notificarErro('Se produjo un error al crear la etiqueta', error)
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
