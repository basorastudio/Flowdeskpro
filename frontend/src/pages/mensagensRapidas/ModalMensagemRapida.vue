<template>
  <q-dialog
    persistent
    :value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card class="q-pa-lg modal-container container-rounded-10">
      <q-card-actions align="right" class="q-mt-md">
        <q-btn flat color="negative" v-close-popup icon="eva-close" />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 text-center font-family-main">
          {{ mensagemRapida.id ? 'Editar' : 'Crear' }} Mensaje Rápido {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="row q-my-md q-pa-lg container-border container-rounded-10">
          <div class="full-width text-h6 font-family-main q-mb-sm">Clave</div>
          <div class="full-width">
            <q-input
              rounded
              outlined
              v-model="mensagemRapida.key"
              label="Clave"
            />
            <p class="text-center" style="font-size: 10px;">
              La clave es el atajo para buscar el mensaje por los usuarios.
            </p>
          </div>
        </div>
        <div class="row items-center container-border container-rounded-10 q-pa-lg">
          <div class="text-h6 full-width font-family-main q-mb-sm">Mensaje</div>
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn round flat class="q-ml-sm">
              <q-icon size="2em" name="mdi-emoticon-happy-outline" />
              <q-tooltip>Emoji</q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="es"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
            <q-btn round flat class="q-ml-sm">
            <q-icon size="2em" name="mdi-variable" />
            <q-tooltip>
              Variables
            </q-tooltip>
            <q-menu touch-position>
              <q-list dense
                style="min-width: 100px">
                <q-item v-for="variavel in variaveis"
                  :key="variavel.label"
                  clickable
                  @click="onInsertSelectVariable(variavel.value)"
                  v-close-popup>
                  <q-item-section>{{ variavel.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensaje:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              @input="(v) => mensagemRapida.message = v.target.value"
              :value="mensagemRapida.message"
            />
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <q-file dense outlined v-model="arquivoCarregado" label="Elija el archivo" filled />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mt-md">
        <q-btn label="Cancelar" color="negative" v-close-popup class="q-mr-md btn-rounded-50" />
        <q-btn
          label="Guardar"
          class="generate-button btn-rounded-50"
          @click="handleMensagemRapida"
          icon="eva-save-outline"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'

import { CriarMensagemRapida, AlterarMensagemRapida } from 'src/service/mensagensRapidas'
export default {
  name: 'ModalMensagemRapida',
  components: { VEmojiPicker },
  props: {
    modalMensagemRapida: {
      type: Boolean,
      default: false
    },
    mensagemRapidaEmEdicao: {
      type: Object,
      default: () => {
        return { id: null, key: '', message: '', medias: '' }
      }
    }
  },
  data () {
    return {
      mensagemRapida: {
        key: null,
        message: '',
        medias: null
      },
      arquivoCarregado: null,
      loading: false,
      variaveis: [
        { label: 'Nombre Completo', value: '{{name}}' },
        { label: 'Nombre', value: '{{firstName}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'Teléfono', value: '{{phoneNumber}}' },
        { label: 'Correo Electrónico del Contacto', value: '{{email}}' },
        { label: 'Número Ticket', value: '{{ticket_id}}' },
        { label: 'Hora', value: '{{hour}}' },
        { label: 'Fecha', value: '{{date}}' },
        { label: 'Fila', value: '{{fila}}' },
        { label: 'Nombre del Agente', value: '{{user}}' },
        { label: 'Correo del Agente', value: '{{userEmail}}' }
      ]
    }
  },
  methods: {
    limparArquivo() {
      this.arquivoCarregado = null
    },
    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener la posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtrar:
      if (!variable) {
        return
      }
      // insertar:
      self.txtContent = this.mensagemRapida.message
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.mensagemRapida.message = self.txtContent
      // mover el cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      if (!emoji.data) {
        return
      }
      self.txtContent = this.mensagemRapida.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.mensagemRapida.message = self.txtContent
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    fecharModal () {
      this.$emit('update:mensagemRapidaEmEdicao', { id: null })
      this.$emit('update:modalMensagemRapida', false)
    },
    abrirModal () {
      if (this.mensagemRapidaEmEdicao.id) {
        this.mensagemRapida = { ...this.mensagemRapidaEmEdicao }
        this.arquivoCarregado = this.mensagemRapidaEmEdicao.media
      } else {
        this.mensagemRapida = {
          key: null,
          message: '',
          medias: null
        }
        this.arquivoCarregado = null
      }
    },
    async handleMensagemRapida () {
      if (!this.mensagemRapida.key) {
        this.$q.notify({
          type: 'negative',
          message: 'La clave no puede estar en blanco.'
        })
        return
      }
      if (!this.mensagemRapida.message && !this.arquivoCarregado) {
        this.$q.notify({
          type: 'negative',
          message: 'Debe escribir el mensaje o elegir un archivo.'
        })
        return
      }

      this.loading = true
      try {
        let data
        const formData = new FormData()
        formData.append('key', this.mensagemRapida.key)
        formData.append('message', this.mensagemRapida.message)
        if (this.arquivoCarregado) {
          formData.append('medias', this.arquivoCarregado)
        } else {
          formData.append('medias', null)
        }

        if (this.mensagemRapida.id) {
          data = await AlterarMensagemRapida(this.mensagemRapida.id, formData)
          this.$emit('mensagemRapida:editada', { ...this.mensagemRapida, ...data.data })
        } else {
          data = await CriarMensagemRapida(formData)
          this.$emit('mensagemRapida:criada', { ...this.mensagemRapida, ...data.data })
        }

        this.$q.notify({
          type: 'positive',
          message: this.mensagemRapida.id ? '¡Mensaje rápido actualizado con éxito!' : '¡Mensaje rápido creado con éxito!'
        })
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$q.notify({
          type: 'negative',
          message: 'Ocurrió un error al guardar el mensaje rápido.'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
