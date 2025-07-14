<template>
  <div>

    <div class="bg-transparent fast-messages-list" v-if="cMensagensRapidas.length > 0 && ticketFocado.status === 'open'">
        <q-badge class="text-white item-fast-messages-list q-pa-sm" v-for="(resposta, index) in cMensagensRapidas" :key="resposta.key" clickable v-close-popup @click="mensagemRapidaSelecionada(resposta)"
        :class="getBadgeClass(index)">
          <q-item-label class="text-bold">
                  {{ resposta.key }}
          </q-item-label>
          <q-tooltip content-class="bg-padrao text-grey-9 text-bold" anchor="top middle" self="bottom middle">
            {{ resposta.message }}
          </q-tooltip>
        </q-badge>
      </div>

    <div @drop.prevent="handleFileDrop" @dragover.prevent>
      <div class="drop-area" @drop="handleFileDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">

        <div class="row q-col-gutter-md" v-if="isScheduleDate">
          <div class="col-xs-12 col-md-6">
            <q-select :options="schedule.options" v-model="schedule.selected" map-options outlined @input="onSelectSchedule" />
          </div>
          <div class="col-xs-12 col-md-6">
            <q-datetime-picker outlined stack-label label="Fecha/Hora Programación" mode="datetime" v-model="scheduleDate" format24h :readonly="schedule.selected.value !== 'custom'" />
          </div>
        </div>

      <div class="q-py-md row bg-white justify-start items-center text-grey-9 relative-position">
      <template v-if="!isRecordingAudio">

            <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions" class="btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'green' : ''" :class="{
                  'text-green bg-black': $q.dark.isActive,
                  '': !$q.dark.isActive
                  }">
              <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" labelSearch="Buscar..." lang="es" @select="onInsertSelectEmoji" />
              </q-menu>
            </q-btn>

            <q-btn flat dense round icon="eva-plus-outline" :class="{
                  'text-green bg-black': $q.dark.isActive,
                  'tab-item': !$q.dark.isActive
                  }" v-if="$q.screen.width > 500">
              <q-menu>
                  <q-list style="min-width: 100px;">
                    <q-item class="text-left" style="padding: 0">
                      <q-btn
                        flat
                        @click="abrirEnvioArquivo"
                        icon="mdi-paperclip"
                        :disable="cDisableActions || desabilitarInput"
                        class=" btn-rounded full-width"
                        :color="$q.dark.isActive ? 'green' : ''"
                        label="Enviar archivo"
                      >
                    </q-btn>
                    </q-item>
                    <q-item style="padding: 0">
                      <q-btn
                      flat
                      @click="handlSendLinkVideo"
                      icon="mdi-message-video"
                      :disable="cDisableActions || desabilitarInput"
                      :color="$q.dark.isActive ? 'green' : ''"
                      label="Enviar enlace de videoconferencia"
                      >
                    </q-btn>
                    </q-item>
                  </q-list>
              </q-menu>
            </q-btn>

            <q-btn
              v-if="mensagemRapidaMedia"
              flat
              dense
              icon="mdi-cancel"
              class="bg-padrao btn-rounded q-mx-xs"

              :color="$q.dark.isActive ? 'red' : 'red'"
              @click="removerMediaMensagemRapida"
            >
              <q-tooltip content-class="text-bold"> Eliminar los medios del mensaje rápido </q-tooltip>
            </q-btn>

            <q-input
              hide-bottom-space
              :loading="loading"
              :disable="cDisableActions"
              ref="inputEnvioMensagem"
              id="inputEnvioMensagem"
              type="textarea"
              @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagem() : '')"
              v-show="!cMostrarEnvioArquivo"
              class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
              bg-color="grey-2"
              color="grey-7"
              placeholder="Ingrese su mensaje"
              input-style="max-height: 30vh"
              autogrow
              rounded
              dense
              outlined
              v-model="textChat"
              :value="textChat"
              @paste="handleInputPaste"
            >

              <template v-slot:prepend v-if="$q.screen.width < 500">
                <q-btn  flat icon="mdi-emoticon-happy-outline" :disable="cDisableActions" dense round :color="$q.dark.isActive ? 'green' : ''">
                  <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
                  <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                    <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" labelSearch="Buscar..." lang="es" @select="onInsertSelectEmoji" />
                  </q-menu>
                </q-btn>
              </template>

              <template v-slot:append>
                <q-btn
                  flat
                  @click="abrirEnvioArquivo"
                  icon="mdi-paperclip"
                  :disable="cDisableActions"
                  dense
                  round
                  v-if="$q.screen.width < 500"
                  class="bg-padrao full-width"
                  :color="$q.dark.isActive ? 'green' : ''"
                >
                  <q-tooltip content-class=" text-bold"> Enviar archivo </q-tooltip>
                </q-btn>

                <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-md" :color="sign ? 'positive' : 'black'" type="toggle" v-if="userProfile === 'admin'">
                <q-tooltip> {{ sign ? 'Desactivar' : 'Activar' }} Firma </q-tooltip>
                </q-toggle>
                <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-md" :color="sign ? 'positive' : 'black'" type="toggle" v-if="disabledSign && userProfile !== 'admin'">
                  <q-tooltip> {{ sign ? 'Desactivar' : 'Activar' }} Firma </q-tooltip>
                </q-toggle>

              </template>
            </q-input>

            <q-file
              :loading="loading"
              :disable="cDisableActions || desabilitarInput"
              ref="PickerFileMessage"
              id="PickerFileMessage"
              v-show="cMostrarEnvioArquivo"
              v-model="arquivos"
              class="col-grow q-mx-xs PickerFileMessage"
              bg-color="blue-grey-1"
              input-style="max-height: 30vh"
              outlined
              use-chips
              multiple
              autogrow
              dense
              rounded
              append
              :max-files="5"
              :max-file-size="52428800"
              :max-total-size="52428800"
              :accept="accept"
              @rejected="onRejectedFiles"
            />

            <q-btn
              v-if="textChat || cMostrarEnvioArquivo || removeMedia"
              ref="btnEnviarMensagem"
              @click="enviarMensagem"
              :disabled="ticketFocado.status !== 'open'"
              flat
              icon="mdi-send"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'green' : ''"
            >
              <q-tooltip content-class=" text-bold"> Enviar Mensaje </q-tooltip>
            </q-btn>

            <q-btn
              v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio"
              @click="handleSartRecordingAudio"
              :disabled="cDisableActions || desabilitarInput"
              flat
              icon="eva-mic-outline"
              class="btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'green' : ''"
              :class="{
                  'text-green bg-black': $q.dark.isActive,
                  '': !$q.dark.isActive
                  }"
            >
              <q-tooltip content-class="text-bold"> Enviar Audio </q-tooltip>
            </q-btn>
          </template>

          <template v-else>
            <div class="full-width items-center row justify-end">
              <q-skeleton animation="pulse-y" class="col-grow q-mx-md" type="text" />
              <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio">
                <q-btn flat icon="mdi-close" color="negative" @click="handleCancelRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
                <RecordingTimer class="text-bold" :class="{ 'text-green': $q.dark.isActive }" />
                <q-btn flat icon="mdi-send-circle-outline" color="positive" @click="handleStopRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
              </div>
            </div>
          </template>
        </div>

        <q-dialog v-model="abrirModalPreviewImagem" position="right" @hide="hideModalPreviewImagem" @show="showModalPreviewImagem">
          <q-card style="height: 90vh; min-width: 60vw; max-width: 60vw" class="q-pa-md">
            <q-card-section>
              <div class="text-h6">
                {{ urlMediaPreview.title }}
                <q-btn class="float-right" icon="close" color="negative" round outline @click="hideModalPreviewImagem" />
              </div>
            </q-card-section>
            <q-card-section>
              <q-img :src="urlMediaPreview.src" spinner-color="green" class="img-responsive mdi-image-auto-adjust q-uploader__file--img" style="height: 60vh; min-width: 55vw; max-width: 55vw" />
            </q-card-section>
            <q-card-actions align="center">
              <q-btn ref="qbtnPasteEnvioMensagem" label="Enviar" color="primary" v-close-popup @click="enviarMensagem" @keypress.enter.exact="enviarMensagem()" />
            </q-card-actions>
            <span class="row col text-caption text-blue-grey-10">* Confirmar envio: Enter</span>
            <span class="row col text-caption text-blue-grey-10">** Cancelar: ESC</span>
          </q-card>
        </q-dialog>

    </div>

  </div>
</template>

<script>
import { LocalStorage, uid } from 'quasar'
import mixinCommon from './mixinCommon'
import { EnviarMensagemTexto } from 'src/service/tickets'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'
import RecordingTimer from './RecordingTimer'
import MicRecorder from 'mic-recorder-to-mp3'
const Mp3Recorder = new MicRecorder({ bitRate: 128 })
import { add, format } from 'date-fns'
import { ListarConfiguracoes } from 'src/service/configuracoes'

export default {
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null
    },
    isScheduleDate: {
      type: Boolean,
      default: false
    },
    mensagensRapidas: {
      type: Array,
      default: () => []
    }
  },
  components: {
    VEmojiPicker,
    RecordingTimer
  },
  data () {
    return {
      schedule: {
        selected: { label: 'Horario personalizado', value: 'custom', func: null },
        options: [
          { label: 'Horario personalizado', value: 'custom', func: null },
          { label: 'En 30 minutos', value: '30_mins', func: () => add(new Date(), { minutes: 30 }) },
          { label: 'Mañana', value: 'amanha', func: () => add(new Date(), { days: 1 }) },
          { label: 'La próxima semana', value: 'prox_semana', func: () => add(new Date(), { weeks: 1 }) }
        ]
      },
      loading: false,
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
      urlMediaPreview: {
        title: '',
        src: ''
      },
      visualizarMensagensRapidas: false,
      arquivos: [],
      textChat: '',
      sign: false,
      scheduleDate: null,
      userProfile: 'user',
      mensagemRapidaMedia: '',
      mensagemRapidaSetada: false,
      removeMedia: false,
      accept: '.txt, .xml, .jpg, .png, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .ogg, .mp3, .pptx, image/*, .mpeg, .pfx, .p2k',
      disabledSign: false
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo () {
      return this.arquivos.length > 0
    },
    cDisableActions () {
      return (this.isRecordingAudio || this.ticketFocado.status !== 'open')
    },
    cMensagensRapidas () {
      let search = this.textChat?.toLowerCase()
      if (search && search.trim().startsWith('/')) {
        search = search.replace('/', '')
      }
      return !search ? this.mensagensRapidas : this.mensagensRapidas.filter(r => r.key.toLowerCase().indexOf(search) !== -1)
      // return this.mensagensRapidas
    }
  },
  methods: {
    onSelectSchedule(newValue) {
      if (!newValue.func) {
        this.scheduleDate = null
        return
      }
      const date = newValue.func()
      this.scheduleDate = format(date, 'yyyy-MM-dd HH:mm')
    },
    handleFileDrop(event) {
      const files = event.dataTransfer.files
      if (files.length) {
        this.textChat = ''
        this.arquivos = [files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: `Enviar imagen a ${this.ticketFocado?.contact?.name}`,
          src: this.openFilePreviewDD(files[0])
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    handleDragOver(event) {
      event.preventDefault()
      event.currentTarget.classList.add('dragover')
    },
    handleDragLeave(event) {
      event.currentTarget.classList.remove('dragover')
    },
    openFilePreviewDD(file) {
      const urlImg = window.URL.createObjectURL(file)
      return urlImg
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
      const enabledSign = this.configuracoes.filter(item => item.key === 'userDisableSignature')[0]
      if (enabledSign.value === 'enabled') {
        this.disabledSign = true
      } else {
        LocalStorage.set('sign', true)
        this.disabledSign = false
      }
    },
    openFilePreview (event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputDrop(evt) {
      const allowed = this.accept.split(',').map((a) => a.trim())
      this.textChat = ''
      this.arquivos = [
        ...this.arquivos,
        ...[...evt.dataTransfer.files].filter((file) => {
          const ext = file.name.split('.').pop()
          const extensionPattern = allowed.map((ext) => ext.replace(/\./g, '\\.').replace(/\*/g, '.*')).join('|')
          const regex = new RegExp(`^(${extensionPattern})$`, 'i')
          return regex.test(file.type) || regex.test('.' + ext)
        })
      ]

      if (!this.arquivos.length) {
        this.$q.notify({
          message: 'Archivo no válido!',
          caption: `Formatos aceptados: ${allowed.join(', ')}`,
          type: 'negative'
        })
        return
      }

      this.$refs.inputEnvioMensagem.focus()
    },
    handleInputPaste (e) {
      if (!this.ticketFocado?.id) return
      if (e.clipboardData.files[0]) {
        this.textChat = ''
        this.arquivos = [e.clipboardData.files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: `Enviar imagen a ${this.ticketFocado?.contact?.name}`,
          src: this.openFilePreview(e)
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    removerMediaMensagemRapida() {
      this.removeMedia = false
      this.mensagemRapidaMedia = ''
      this.mensagemRapidaSetada = false
    },
    mensagemRapidaSelecionada(mensagem) {
      if (mensagem.message !== 'null') {
        this.textChat = mensagem.message
      }
      if (this.mensagemRapidaMedia !== null) {
        this.mensagemRapidaMedia = mensagem.media
        this.removeMedia = true
      }
      if (this.mensagemRapidaMedia !== null) {
        this.mensagemRapidaSetada = true
        this.removeMedia = true
      }
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
    },
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem.$refs.input
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value

      // filter:
      if (!emoji.data) {
        return
      }

      // insert:
      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    abrirEnvioArquivo (event) {
      this.textChat = ''
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleSartRecordingAudio () {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        await Mp3Recorder.start()
        this.isRecordingAudio = true
      } catch (error) {
        this.isRecordingAudio = false
      }
    },
    async handleStopRecordingAudio () {
      this.loading = true
      try {
        const [, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('fromMe', true)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        const ticketId = this.ticketFocado.id
        await EnviarMensagemTexto(ticketId, formData)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        this.loading = false
        this.$notificarErro('¡Se produjo un error!', error)
      }
    },
    async handleCancelRecordingAudio () {
      try {
        await Mp3Recorder.stop().getMp3()
        this.isRecordingAudio = false
        this.loading = false
      } catch (error) {
        this.$notificarErro('¡Se produjo un error!', error)
      }
    },
    prepararUploadMedia () {
      if (!this.arquivos.length) {
        throw new Error('No hay archivos para el envío')
      }
      const formData = new FormData()
      formData.append('fromMe', true)
      this.arquivos.forEach(media => {
        formData.append('medias', media)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
      })
      return formData
    },
    prepararMensagemTexto () {
      if (this.textChat.trim() === '' && !this.removeMedia) {
        throw new Error('Mensagem Inexistente')
      }

      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find(m => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error = this.cMensagensRapidas.length > 1
            ? 'Se encontraron varios mensajes rápidos. Seleccione uno o escriba una clave de mensaje única.'
            : '/ Indica que desea enviar un mensaje rápido, pero no se encontró ninguno. Registre o borre y escriba su mensaje.'
          this.$notificarErro(error)
          this.loading = false
          console.error(error)
          throw new Error(error)
        }
      }

      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: this.mensagemRapidaSetada ? `${this.mensagemRapidaMedia}` : '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid()
      }

      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }

      return message
    },
    async enviarMensagem () {
      if (this.isScheduleDate && !this.scheduleDate) {
        this.$notificarErro('Para programar un mensaje, complete el campo Fecha/Hora de Programación.')
        return
      }
      this.loading = true

      if (this.mensagemRapidaSetada) {
        this.cMostrarEnvioArquivo = false
      }

      const ticketId = this.ticketFocado.id
      const message = !this.cMostrarEnvioArquivo
        ? this.prepararMensagemTexto()
        : this.prepararUploadMedia()

      try {
        if (!this.cMostrarEnvioArquivo && !this.textChat && !this.removeMedia) return
        await EnviarMensagemTexto(ticketId, message)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        this.removeMedia = false
        this.mensagemRapidaMedia = ''
        this.mensagemRapidaSetada = false
        this.loading = false
        this.$notificarErro('¡Se produjo un error!', error)
        console.error('Error enviando el mensaje:', error)
      }
      this.removeMedia = false
      this.mensagemRapidaMedia = ''
      this.mensagemRapidaSetada = false
      this.isRecordingAudio = false
      this.loading = false
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
    },
    async handlSendLinkVideo () {
      const link = `https://meet.jit.si/${uid()}/${uid()}`
      let mensagem = link
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid(),
        ticket: this.ticketFocado,
        group: this.ticketFocado.isGroup
      }

      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        await EnviarMensagemTexto(ticketId, message)
        setTimeout(() => {
          this.scrollToBottom()
        }, 200)
        setTimeout(() => {
          window.open(link, '_blank')
        }, 800)
      } catch (error) {
        this.loading = false
        this.$notificarErro('¡Se produjo un error!', error)
      }
      this.loading = false
    },
    handlerInputMensagem (v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem () {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem () {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    },
    onRejectedFiles (rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `Ups ... ¡ocurrió un error! <br>
        <ul>
          <li>Verifique el tamaño del archivo.</li>
          <li>En el caso de múltiples archivos, el tamaño total (suma de todos) debe ser de hasta 50 MB.</li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    },
    onResize() {
      this.$forceUpdate()
    },
    calculateEmojisByRow() {
      const screenWidth = window.innerWidth
      if (screenWidth < 600) {
        return 5
      } else if (screenWidth >= 600 && screenWidth < 1200) {
        return 10
      } else {
        return 20
      }
    },
    getBadgeClass(index) {
      const colors = ['bg-green-6', 'bg-orange-6', 'bg-teal-6', 'bg-blue-6', 'bg-deep-purple-6', 'bg-yellow-6', 'bg-brown-6', 'bg-cyan-6']
      const colorIndex = index % 8
      // console.log(index);
      return colors[colorIndex]
    },
    handleSign (state) {
      this.sign = state
      LocalStorage.set('sign', this.sign)
    }
  },
  mounted () {
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
    const self = this
    window.addEventListener('paste', self.handleInputPaste)
    this.listarConfiguracoes()
    this.userProfile = localStorage.getItem('profile')
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      this.handleSign(LocalStorage.getItem('sign'))
    }
  },
  beforeDestroy () {
    const self = this
    window.removeEventListener('paste', self.handleInputPaste)
  },
  destroyed () {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  }
}
</script>

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important

.emoji-picker
  width: 100%

@media (min-width: 600px)
  .emoji-picker
    width: 50vw

</style>
