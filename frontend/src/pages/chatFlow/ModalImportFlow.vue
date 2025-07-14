<template>
  <q-dialog
    :value="modalImportFlow"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card class="q-pa-lg modal-container container-rounded-10">
      <q-card-actions align="right" class="q-mt-md">
        <q-btn color="negative" v-close-popup icon="eva-close" flat />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 text-center font-family-main">
          Importar Flujo
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg container-border container-rounded-10">
        <q-separator spaced />
        <div class="col-12">
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Seleccione el archivo para importar:</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <input
                type="file"
                @change="onFileChange"
                ref="fileInput"
                class="file-input"
                accept="application/json"
              />
              <button
                @click="triggerFileInput"
                :class="{
                  'file-button': true,
                  'file-button-dark': $q.dark.isActive,
                  'file-button-light': !$q.dark.isActive
                }"
                class="btn-rounded-50"
              >
                <q-icon name="eva-plus-outline" />
                Elija archivo
              </button>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarChatFlow } from 'src/service/chatFlow'

export default {
  name: 'ModalImportFlow',
  props: {
    modalImportFlow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      importedFlow: null
    }
  },
  methods: {
    fecharModal () {
      this.importedFlow = null
      this.$emit('update:chatFlowEdicao', { id: null })
      this.$emit('update:modalImportFlow', false)
    },
    async handleAutoresposta () {
      const flow = this.importedFlow
      const { data } = await CriarChatFlow(flow)
      this.$notificarSucesso('Nuevo flujo creado.')
      this.$emit('chatFlow:criada', data)
      this.fecharModal()
    },
    onFileChange (event) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          this.importedFlow = JSON.parse(e.target.result)
          this.$notificarSucesso('Flujo importado exitoso.')
          await this.handleAutoresposta()
        } catch (error) {
          this.$notificarErro('Error al importar flujo. Revise el archivo y vuelva a intentarlo.')
        }
      }
      reader.readAsText(file)
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    }
  }
}
</script>

<style scoped>
.file-input {
  display: none;
}

.file-button {
  font-size: 14px;
  line-height: 1.715em;
  color: inherit;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-button-dark {
  background-color: #4caf50; /* Cor para o modo escuro */
  color: white;
}

.file-button-light {
  background-color: #ff7103; /* Cor para o modo claro */
  color: white;
}

.file-button .q-icon {
  font-size: 1.2em; /* Ajuste o tamanho do ícone conforme necessário */
}

.generate-button-dark {
  background-color: #4caf50; /* Cor para o modo escuro */
  color: white;
}

.generate-button-light {
  background-color: #ff7103; /* Cor para o modo claro */
  color: white;
}

.generate-button .q-icon {
  font-size: 1.2em; /* Ajuste o tamanho do ícone conforme necessário */
}
</style>
