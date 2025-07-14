<template>
  <q-dialog
    persistent
    :value="modalIntegracao"
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
          icon="eva-close"
          color="negative"
          v-close-popup
          flat
        />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 text-center font-family-main">{{ integracaoEdicao.id ? 'Editar': 'Crear' }} Integración</div>
      </q-card-section>
      <q-card-section class="container-border container-rounded-10">
        <div class="text-h6 font-family-main q-mb-sm">
          Información
        </div>
          <div class="col-12 q-my-sm">
            <q-select :disable="!!integracao.id"
              v-model="integracao.type"
              :options="integracaoTypes"
              :validator="$v.integracao.type"
              @blur="$v.integracao.type.$touch"
              label="Tipo"
              emit-value
              map-options
              filled />
          </div>
          <div class="col-12">
        <q-input
          class="row col"
          rounded
          outlined
          v-model="integracao.name"
          :validator="$v.integracao.name"
          @blur="$v.integracao.name.$touch"
          label="Nombre de la Integración"
        />
          </div>
        <div class="col-12 q-my-sm">
          <q-select
            v-if="integracao.type === 'openai'"
            rounded
            outlined
                    v-model="integracao.aiModel"
                    :options="modelsOpenai"
                    label="Modelo"
                    emit-value
                    map-options
                    filled />
        </div>
        <div class="col-12 q-my-sm">
          <q-select
            v-if="integracao.type === 'groq'"
            rounded
            outlined
            v-model="integracao.aiModel"
            :options="modelsGroq"
            label="Modelo"
            emit-value
            map-options
            filled />
        </div>
          <div class="col-12">
        <q-input
          v-if="integracao.type === 'typebot' | integracao.type === 'n8n'"
          class="row col"
          rounded
          outlined
          v-model="integracao.urlN8N"
          label="URL Integración"
        />
          </div>
        <div class="col-12">
        <textarea
          style="min-height: 25vh; max-height: 25vh;"
          class="q-pa-sm bg-white full-width rounded-borders"
          rounded
          outlined
          v-if="integracao.type === 'openai' | integracao.type === 'groq'"
          placeholder="Prompt"
          v-model="integracao.jsonContent" />
        </div>
        <div class="col-12">
        <q-select
          v-if="integracao.type === 'openai' | integracao.type === 'groq'"
          class="row col"
          rounded
          outlined
          label="Fila"
          v-model="integracao.queueId"
          :options="listaFila"
          map-options
          emit-value
          option-value="id"
          option-label="queue"
          clearable
        >
          <q-tooltip>
            La fila será asignada si se solicita al BOT
          </q-tooltip>
        </q-select>
        </div>
          <div class="col-12">
        <q-input
          v-if="integracao.type === 'n8n'"
          class="row col"
          rounded
          outlined
          v-model="integracao.n8nApiKey"
          label="N8N API KEY"
        />
          </div>
          <div class="col-12">
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          v-model="integracao.typebotSlug"
          label="Typebot - Slug"
        />
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          type="number"
          v-model="integracao.typebotExpires"
          label="Tiempo en minutos para expirar una conversación"
        />
        <q-input
          v-if="integracao.type === 'typebot' | integracao.type === 'openai' | integracao.type === 'groq'"
          class="row col"
          rounded
          outlined
          type="number"
          v-model="integracao.typebotDelayMessage"
          label="Intervalo (ms) entre mensajes"
        />
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          v-model="integracao.typebotKeywordFinish"
          label="Palabra que cierra ticket"
        />
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          v-model="integracao.typebotKeywordRestart"
          label="Palabra que reinicia el Flujo"
        />
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          v-model="integracao.typebotUnknownMessage"
          label="Mensaje si la opción elegida es inválida"
        />
        <q-input
          v-if="integracao.type === 'typebot'"
          class="row col"
          rounded
          outlined
          v-model="integracao.typebotRestartMessage"
          label="Mensaje al reiniciar flujo"
        />
            <q-input
              v-if="integracao.type === 'openai' | integracao.type === 'groq'"
              class="row col"
              rounded
              outlined
              v-model="integracao.apiKey"
              label="API Key"
            />
            <q-input
              v-if="integracao.type === 'openai' | integracao.type === 'groq'"
              class="row col"
              rounded
              outlined
              type="number"
              v-model="integracao.maxTokens"
              label="Máximo de tokens en la respuesta"
            />
            <q-input
              v-if="integracao.type === 'openai' | integracao.type === 'groq'"
              class="row col"
              rounded
              outlined
              type="number"
              v-model="integracao.maxMessages"
              label="Máximo de mensajes en el historial"
            />
            <q-input
              v-if="integracao.type === 'openai' | integracao.type === 'groq'"
              class="row col"
              rounded
              outlined
              type="number"
              v-model="integracao.temperature"
              label="Temperatura"
            />
          </div>
        <div class="col-12 q-my-sm">
          <q-select
            v-if="integracao.type === 'openai' | integracao.type === 'groq'"
            rounded
            outlined
            v-model="integracao.voice"
            :options="AudiosIA"
            label="Formato de la respuesta de la IA"
            emit-value
            map-options
            filled />
        </div>
        <div class="col-12 q-my-sm">
        <q-input
          v-if="integracao.type === 'openai' | integracao.type === 'groq'"
          class="row col"
          rounded
          outlined
          v-model="integracao.voiceKey"
          label="API Key Servicio de Voz"
        />
        </div>
        <div class="col-12 q-my-sm">
          <q-input
            v-if="integracao.type === 'openai' | integracao.type === 'groq'"
            class="row col"
            rounded
            outlined
            v-model="integracao.voiceRegion"
            label="Ubicación/región del Servicio de Voz"
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
          @click="handleIntegracao"
          icon="eva-save-outline"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { CriarIntegracao, AlterarIntegracao } from 'src/service/integracoes'
import { ListarFilas } from 'src/service/filas'
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'ModalIntegracao',
  props: {
    modalIntegracao: {
      type: Boolean,
      default: false
    },
    integracaoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      listaFila: [],
      integracaoTypes: [
        { label: 'N8N/WebHook', value: 'n8n' },
        { label: 'Typebot', value: 'typebot' },
        { label: 'OpenAi', value: 'openai' },
        { label: 'GroqCloud', value: 'groq' }
      ],
      modelsOpenai: [
        { label: 'gpt-4o', value: 'gpt-4o' },
        { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
        { label: 'gpt-4-turbo', value: 'gpt-4-turbo' },
        { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
        { label: 'gpt-3.5-turbo-instruct', value: 'gpt-3.5-turbo-instruct' }
      ],
      modelsGroq: [
        { label: 'Meta Llama 3 8B', value: 'llama3-8b-8192' },
        { label: 'Gemma 7B', value: 'gemma-7b-it' },
        { label: 'Gemma 2 9B', value: 'gemma2-9b-it' },
        { label: 'Llama 3.1 70B (Vista Previa)', value: 'llama-3.1-70b-versatile' },
        { label: 'Llama 3.1 8B (Vista Previa)', value: 'llama-3.1-8b-instant' },
        { label: 'Meta Llama 3 70B', value: 'llama3-70b-8192' },
        { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' }
      ],
      AudiosIA: [
        { label: 'Texto', value: 'texto' },
        { label: 'Francisca', value: 'es-FranciscaNeural' },
        { label: 'Antônio', value: 'es-AntonioNeural' },
        { label: 'Brenda', value: 'es-BrendaNeural' },
        { label: 'Donato', value: 'es-DonatoNeural' },
        { label: 'Elza', value: 'es-ElzaNeural' },
        { label: 'Fábio', value: 'es-FabioNeural' },
        { label: 'Giovanna', value: 'es-GiovannaNeural' },
        { label: 'Humberto', value: 'es-HumbertoNeural' },
        { label: 'Julio', value: 'es-JulioNeural' },
        { label: 'Leila', value: 'es-LeilaNeural' },
        { label: 'Letícia', value: 'es-LeticiaNeural' },
        { label: 'Manuela', value: 'es-ManuelaNeural' },
        { label: 'Nicolau', value: 'es-NicolauNeural' },
        { label: 'Valério', value: 'es-ValerioNeural' },
        { label: 'Yara', value: 'es-YaraNeural' }
      ],
      integracao: {
        id: null,
        type: null,
        name: null,
        projectName: null,
        jsonContent: null,
        urlN8N: null,
        language: null,
        typebotSlug: null,
        typebotExpires: null,
        typebotKeywordFinish: null,
        typebotUnknownMessage: null,
        typebotDelayMessage: null,
        typebotKeywordRestart: null,
        typebotRestartMessage: null,
        n8nApiKey: null,
        aiModel: null,
        apiKey: null,
        maxTokens: null,
        temperature: null,
        maxMessages: null,
        voice: null,
        voiceKey: null,
        voiceRegion: null,
        queueId: null
      }
    }
  },
  validations: {
    integracao: {
      name: { required },
      type: { required }
    }
  },
  methods: {
    async buscaFilas() {
      const { data } = await ListarFilas()
      this.listaFila = data.filter(f => f.isActive)
    },
    resetarIntegracao () {
      this.integracao = {
        id: null,
        type: null,
        name: null,
        projectName: null,
        jsonContent: null,
        urlN8N: null,
        language: null,
        typebotSlug: null,
        typebotExpires: null,
        typebotKeywordFinish: null,
        typebotUnknownMessage: null,
        typebotDelayMessage: null,
        typebotKeywordRestart: null,
        typebotRestartMessage: null,
        n8nApiKey: null,
        aiModel: null,
        apiKey: null,
        maxTokens: null,
        temperature: null,
        maxMessages: null,
        voice: null,
        voiceKey: null,
        voiceRegion: null,
        queueId: null
      }
    },
    fecharModal () {
      this.resetarIntegracao()
      this.$emit('update:integracaoEdicao', { id: null })
      this.$emit('update:modalIntegracao', false)
    },
    abrirModal () {
      if (this.integracaoEdicao.id) {
        this.integracao = { ...this.integracaoEdicao }
      } else {
        this.resetarIntegracao()
      }
    },
    async handleIntegracao () {
      if (this.$v.integracao.$invalid) {
        this.$v.$touch()
        this.$q.notify('Ingrese todos los datos correctamente.')
        return
      }
      try {
        this.loading = true
        if (this.integracao.id) {
          const { data } = await AlterarIntegracao(this.integracao)
          this.$emit('modal-integracao:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Integración editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarIntegracao(this.integracao)
          this.$emit('modal-integracao:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Integración creada!',
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
        console.error('Error capturado: ', error)
        if (error.data && error.data.error === 'name must be at least 2 characters') {
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: 'Error al crear la integración, nombre demasiado corto',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else if (error.data && error.data.error === 'This integration name is already used.') {
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: 'Ya existe una integración con este nombre',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          this.$notificarErro('Ocurrió un error al crear la integración', error)
        }
      }
    }
  },
  mounted() {
    this.buscaFilas()
  }
}
</script>

<style lang="scss" scoped>
</style>
