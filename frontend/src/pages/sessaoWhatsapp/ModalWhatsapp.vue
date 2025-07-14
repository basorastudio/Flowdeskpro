<template>
  <q-dialog :value="modalWhatsapp"
    @hide="cerrarModal"
    @show="abrirModal"
    persistent>
    <q-card class="q-pa-md"
      style="width: 500px">
      <q-card-section>
        <div class="text-h6">
          <q-icon size="50px"
            class="q-mr-md"
            :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'" /> {{ whatsapp.id ? 'Editar' :
              'Agregar'
            }}
          Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-my-sm">
            <q-select :disable="!!whatsapp.id"
              v-model="whatsapp.type"
              :options="optionsWhatsappsTypes"
              label="Tipo"
              emit-value
              map-options
              filled />
          </div>
          <div class="col-12">
            <c-input outlined
              label="Nombre"
              v-model="whatsapp.name"
              :validator="$v.whatsapp.name"
              @blur="$v.whatsapp.name.$touch" />
          </div>
          <div class="col-12">
        <q-input
          filled
          hide-bottom-space
          :style="`background: ${whatsapp.color} `"
          v-model="whatsapp.color"
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
                  v-model="whatsapp.color"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
          </div>
          <div class="col-12 q-mt-md"
            v-if="whatsapp.type === 'telegram'">
            <c-input outlined
              label="Token Telegram"
              v-model="whatsapp.tokenTelegram" />
          </div>
          <div class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'instagram'">
            <div class="col">
              <fieldset class="full-width q-pa-md">
                <legend>Datos de la cuenta de Instagram</legend>
                <legend>Solo use si su servidor está en BRASIL</legend>
                <div class="col-12 q-mb-md"
                  v-if="whatsapp.type === 'instagram'">
                  <c-input outlined
                    label="Usuario"
                    v-model="whatsapp.instagramUser"
                    hint="Su usuario de Instagram (sin @)" />
                </div>
                <div v-if="whatsapp.type === 'instagram' && !isEdit"
                  class="text-center">
                  <q-btn flat
                    color="info"
                    class="bg-padrao"
                    icon="edit"
                    label="Nueva contraseña"
                    @click="isEdit = !isEdit">
                    <q-tooltip>
                      Cambiar contraseña
                    </q-tooltip>
                  </q-btn>
                </div>
                <div class="col-12"
                  v-if="whatsapp.type === 'instagram' && isEdit">
                  <c-input filled
                    label="Contraseña"
                    :type="isPwd ? 'password' : 'text'"
                    v-model="whatsapp.instagramKey"
                    hint="Contraseña utilizada para iniciar sesión en Instagram"
                    placeholder="*************"
                    :disable="!isEdit">
                    <template v-slot:after>
                      <q-btn class="bg-padrao"
                        round
                        flat
                        color="negative"
                        icon="mdi-close"
                        @click="isEdit = !isEdit">
                        <q-tooltip>
                          Cancelar cambio de contraseña
                        </q-tooltip>

                      </q-btn>
                    </template>
                    <template v-slot:append>
                      <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                    </template>
                  </c-input>
                </div>
              </fieldset>

            </div>

          </div>
          <!-- <q-checkbox
            class="q-ml-md"
            v-model="whatsapp.isDefault"
            label="Predeterminado"
          /> -->
        </div>

        <div class="row q-my-md">
          <div class="col-12">
            <label class="text-caption">Mensaje de Despedida de la Atención:</label>
            <textarea ref="inputFarewellMessage"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.farewellMessage" />
          </div>
          <q-btn round
            flat
            dense>
            <q-icon size="2em"
              name="mdi-variable" />
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
             <q-btn
                round
                flat
                class="q-ml-sm"
              >
              <q-icon
                size="2em"
                name="mdi-emoticon-happy-outline"
              />
              <q-tooltip>
                Emoji
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <VEmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Buscar..."
                  lang="es-ES"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
        </div>

        <q-checkbox
          v-model="whatsapp.sendGreetingAccepted"
          label="Enviar mensaje al aceptar TICKET"
        />

        <div class="row q-my-md" v-if="whatsapp.sendGreetingAccepted == true">
          <div class="col-12">
            <label class="text-caption"> Mensaje para enviar al aceptar TICKET</label>
            <textarea ref="inputsendGreetingAcceptedMSG"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.sendGreetingAcceptedMSG" />
          <q-btn round
            flat
            dense>
            <q-icon size="2em"
              name="mdi-variable" />
            <q-tooltip>
              Variables
            </q-tooltip>
            <q-menu touch-position>
              <q-list dense
                style="min-width: 100px">
                <q-item v-for="variavel in variaveis2"
                  :key="variavel.label"
                  clickable
                  @click="onInsertSelectVariable2(variavel.value)"
                  v-close-popup>
                  <q-item-section>{{ variavel.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          </div>
          </div>

        <q-checkbox
          v-model="whatsapp.sendMsgTransfTicket"
          label="Enviar mensaje al transferir TICKET"
        />

        <div class="row q-my-md" v-if="whatsapp.sendMsgTransfTicket == true">
          <div class="col-12">
            <label class="text-caption">Mensaje para enviar al transferir TICKET</label>
            <textarea ref="inputsendMsgTransfTicketMSG"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.sendMsgTransfTicketMSG" />
          <q-btn round
            flat
            dense>
            <q-icon size="2em"
              name="mdi-variable" />
            <q-tooltip>
              Variables
            </q-tooltip>
            <q-menu touch-position>
              <q-list dense
                style="min-width: 100px">
                <q-item v-for="variavel in variaveis2"
                  :key="variavel.label"
                  clickable
                  @click="onInsertSelectVariable3(variavel.value)"
                  v-close-popup>
                  <q-item-section>{{ variavel.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          </div>
          </div>

        <q-checkbox
          v-model="whatsapp.rating"
          label="Habilitar evaluación de atención"
        />

        <div class="row q-my-md" v-if="whatsapp.rating == true">
          <div class="col-12">
            <label class="text-caption">Mensaje para solicitar evaluación (nota del 1 al 3):</label>
            <textarea
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.ratingMessage" />

            <label class="text-caption">Mensaje después de que el cliente evalúe la atención:</label>
            <textarea
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.ratingClosing" />

            <label class="text-caption">Mensaje en caso de evaluación inválida:</label>
            <textarea
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              v-model="whatsapp.ratingInvalid" />

            <label class="text-caption">Tiempo en minutos para esperar que el cliente evalúe:</label>

          <div class="col-12">
            <c-input outlined
              label="Tiempo"
              type="number"
              v-model="whatsapp.timeRating" />
          </div>
          </div>
          </div>

        <q-checkbox
          v-model="whatsapp.transcription"
          label="Convertir audio en texto"
        />

        <div class="row q-my-md" v-if="whatsapp.transcription == true">
          <div class="col-12">

          <div class="col-12">
            <c-input outlined
              label="Clave de API para Convertir Audio en Texto"
              v-model="whatsapp.transcriptionkey"/>
          </div>
<td><a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Obtener clave de API para Convertir Audio en Texto</a></td>
          </div>
        </div>

      <q-card-actions align="center"
        class="q-mt-lg">
        <q-btn flat
          label="Salir"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup />
        <q-btn flat
          label="Guardar"
          color="primary"
          class="q-px-md"
          @click="handleSaveWhatsApp(whatsapp)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateWhatsapp, CriarWhatsapp } from 'src/service/sessoesWhatsapp'
import cInput from 'src/components/cInput.vue'
import { copyToClipboard, Notify } from 'quasar'
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  components: { cInput, VEmojiPicker },
  name: 'ModalWhatsapp',
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      isPwd: true,
      isEdit: false,
      whatsapp: {
        name: '',
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        type: 'whatsapp',
        farewellMessage: '',
        ratingMessage: '',
        rating: false,
        ratingClosing: '',
        ratingInvalid: '',
        timeRating: null,
        transcription: false,
        transcriptionkey: '',
        sendMsgTransfTicket: false,
        sendGreetingAcceptedMSG: '',
        sendGreetingAccepted: false,
        sendMsgTransfTicketMSG: '',
        color: ''
      },
      optionsWhatsappsTypes: [
        { label: 'Whatsapp', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' }
        // { label: 'Instagram', value: 'instagram' }
      ],
      variaveis: [
        { label: 'Nombre Completo', value: '{{name}}' },
        { label: 'Nombre', value: '{{firstName}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'Teléfono', value: '{{phoneNumber}}' },
        { label: 'Email del Contacto', value: '{{email}}' },
        { label: 'Número Ticket', value: '{{ticket_id}}' },
        { label: 'Hora', value: '{{hour}}' },
        { label: 'Fecha', value: '{{date}}' },
        { label: 'Cola', value: '{{fila}}' },
        { label: 'Nombre del agente', value: '{{user}}' },
        { label: 'Email del agente', value: '{{userEmail}}' }
      ],
      variaveis2: [
        { label: 'Nombre', value: '{{name}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Teléfono', value: '{{phoneNumber}}' },
        { label: 'Email del Contacto', value: '{{email}}' },
        { label: 'Nombre del Agente', value: '{{user}}' }
      ]
    }
  },
  validations: {
    whatsapp: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputFarewellMessage
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
      self.txtContent = this.whatsapp.farewellMessage
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.farewellMessage = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarExito('¡URL de integración copiada!'))
        .catch()
    },

    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputFarewellMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.farewellMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.farewellMessage = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    onInsertSelectVariable2 (variable) {
      const self = this
      var tArea = this.$refs.inputsendGreetingAcceptedMSG
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.sendGreetingAcceptedMSG
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.sendGreetingAcceptedMSG = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    onInsertSelectVariable3 (variable) {
      const self = this
      var tArea = this.$refs.inputsendMsgTransfTicketMSG
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.sendMsgTransfTicketMSG
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.sendMsgTransfTicketMSG = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    cerrarModal() {
      this.whatsapp = {
        name: '',
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        type: 'whatsapp',
        farewellMessage: '',
        ratingMessage: '',
        rating: false,
        ratingClosing: '',
        ratingInvalid: '',
        timeRating: null,
        transcription: false,
        sendMsgTransfTicket: false,
        sendGreetingAcceptedMSG: '',
        sendGreetingAccepted: false,
        sendMsgTransfTicketMSG: '',
        color: ''
      }
      this.isEdit = false // Resetea el estado de edición de contraseña
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.$v.whatsapp.$touch()
      if (this.$v.whatsapp.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: '¡Ops! Verifique los errores...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      try {
        if (this.whatsAppEdit.id) {
          await UpdateWhatsapp(this.whatsAppEdit.id, whatsapp)
        } else {
          await CriarWhatsapp(whatsapp)
        }
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `Whatsapp ${this.whatsAppEdit.id ? 'editado' : 'creado'} con éxito!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.$emit('recargar-lista')
        this.cerrarModal()
      } catch (error) {
        console.error(error, error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT')
        if (error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT') {
          Notify.create({
            type: 'negative',
            message: 'Límite de conexiones alcanzado, para más conexiones contacte con el equipo de soporte',
            caption: 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT',
            position: 'top',
            progress: true
          })
        } else {
          console.error(error)
          return this.$q.notify({
            type: 'error',
            progress: true,
            position: 'top',
            message: '¡Ops! Verifique los errores... El nombre de la conexión no puede existir en la plataforma, es un identificador único.',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      }
    }
  },
  destroyed () {
    this.$v.whatsapp.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
