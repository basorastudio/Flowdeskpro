<template>
  <q-dialog
    :value="modalChatFlow"
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
          {{ chatFlow.isDuplicate ? 'Duplicar' : chatFlowEdicao.id ? 'Editar' : 'Crear' }} Flujo
          <span v-if="chatFlow.isDuplicate"> (Nombre: {{ chatFlowEdicao.name }}) </span>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg container-border container-rounded-10">
        <div class="text-h6 font-family-main q-mb-sm">
          Información
        </div>
        <q-input
          rounded
          class="row col"
          outlined
          v-model="chatFlow.name"
          label="Descripción"
        />
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="chatFlow.isActive"
            label="Activo"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            rounded
            outlined
            v-model="chatFlow.celularTeste"
            label="Número de prueba"
            hint="Déjalo limpio para que la Auto respuesta funcione. De lo contrario, solo funcionará para el número informado aquí."
          />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mt-md">
        <q-btn label="Cancelar" color="negative" v-close-popup class="q-mr-md btn-rounded-50" />
        <q-btn
          label="Salvar"
          @click="handleAutoresposta"
          :class="{
            'generate-button': true,
            'btn-rounded-50': true,
            'generate-button-dark': $q.dark.isActive,
            'generate-button-light': !$q.dark.isActive
          }"
          icon="eva-save-outline"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarChatFlow, UpdateChatFlow } from 'src/service/chatFlow'
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow'

export default {
  name: 'ModalNovoChatFlow',
  props: {
    modalChatFlow: {
      type: Boolean,
      default: false
    },
    chatFlowEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      chatFlow: {
        name: null,
        userId,
        celularTeste: null,
        isActive: true
      }
    }
  },
  methods: {
    abrirModal () {
      if (this.chatFlowEdicao.id) {
        this.chatFlow = {
          ...this.chatFlowEdicao,
          userId
        }
      } else {
        this.chatFlow = {
          name: null,
          action: 0,
          userId,
          celularTeste: null,
          isActive: true
        }
      }
    },
    fecharModal () {
      this.chatFlow = {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      }
      this.$emit('update:chatFlowEdicao', { id: null })
      this.$emit('update:modalChatFlow', false)
    },
    async handleAutoresposta () {
      const flow = { ...getDefaultFlow(), ...this.chatFlow, id: null }

      if (this.chatFlow.id && !this.chatFlow?.isDuplicate) {
        const { data } = await UpdateChatFlow(this.chatFlow)
        this.$notificarSucesso('Flujo editado.')
        this.$emit('chatFlow:editado', data)
      } else if (!this.chatFlow.id && !this.chatFlow?.isDuplicate) {
        const { data } = await CriarChatFlow(flow)
        this.$notificarSucesso('Nuevo flujo creado.')
        this.$emit('chatFlow:criada', data)
      }
      this.fecharModal()
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
