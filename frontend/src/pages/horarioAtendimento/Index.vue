<template>
  <div v-if="userProfile === 'admin'">
    <q-card
      class="q-ma-lg container-border container-rounded-10"
      square
    >
      <div class="q-pa-sm q-ma-sm">
        <h2 :class="$q.dark.isActive ? ('text-green') : ''">
          Horario de Atención
          <q-icon name="help">
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium"> Tipos de horario: </span>
            <span class="row col">
              Abierto: Establecimiento abierto durante todo el día. No se enviará un mensaje de ausencia;
            </span>
            <span class="row col">
              Cerrado: Establecimiento cerrado durante todo el día. Se enviará un mensaje de ausencia, independientemente del horario;
            </span>
            <span class="row col">
              Horario: Representa el horario de funcionamiento del establecimiento. El sistema enviará un mensaje de ausencia cuando se reciban mensajes fuera de los horarios establecidos.
            </span>
            <span class="row col">
              **Importante: El mensaje de ausencia se enviará después del cierre de la atención automática.
            </span>
          </q-tooltip>
        </q-icon>
        </h2>

        <q-btn
          class="btn-rounded-50 generate-button"
          label="Guardar"
          icon="eva-save-outline"
          @click="salvarHorariosAtendimento"
        />
      </div>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            class="col-xs-12 col-sm-4 q-mt-sm"
            v-for="dia in businessHours"
            :key="dia.value"
          >
            <q-card
              square
              bordered
              flat
              class="container-rounded-10"
            >
              <div class="font-family-main text-bold bg-grey-2 q-pa-xs q-pl-sm" :class="$q.dark.isActive ? ('text-black') : ''">
                {{ dia.label }}
              </div>
              <q-separator />
              <q-card-section class="q-pt-none">
                <q-option-group
                  inline
                  class="row container-border container-rounded-10 q-mt-sm q-pr-md justify-between q-mb-md"
                  v-model="dia.type"
                  :options="optType"
                  color="primary"
                />

                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    error-message="Obligatorio"
                    hide-underline
                    type="time"
                    v-model="dia.hr1"
                  />
                  <h6>a</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    error-message="Obligatorio"
                    hide-underline
                    type="time"
                    v-model="dia.hr2"
                  />
                </div>
                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    error-message="Obligatorio"
                    hide-underline
                    type="time"
                    v-model="dia.hr3"
                  />
                  <h6>a</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    error-message="Obligatorio"
                    hide-underline
                    type="time"
                    v-model="dia.hr4"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card
      square
      bordered
      class="q-ma-lg container-rounded-10 full-full-height"
    >
      <div class="q-pa-sm q-ma-sm">
        <h2 :class="$q.dark.isActive ? ('text-green') : ''">
          Mensaje de Ausencia
        </h2>

        <q-btn
          class="generate-button btn-rounded-50"
          icon="eva-save-outline"
          label="Guardar"
          @click="salvarMensagemAusencia"
        />
      </div>
      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
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
                  labelSearch="Localizar..."
                  lang="es"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
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
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 9vh; max-height: 9vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Escriba el mensaje"
              autogrow
              dense
              outlined
              @input="(v) => messageBusinessHours = v.target.value"
              :value="messageBusinessHours"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'
import { MostrarHorariosAtendiemento, AtualizarHorariosAtendiemento, AtualizarMensagemHorariosAtendiemento } from 'src/service/empresas'
export default {
  name: 'HorarioAtendimento',
  components: { VEmojiPicker },
  data () {
    return {
      userProfile: 'user',
      optType: [
        { value: 'O', label: 'Abierto' },
        { value: 'C', label: 'Cerrado' },
        { value: 'H', label: 'Horario' }
      ],
      variaveis: [
        { label: 'Nombre Completo', value: '{{name}}' },
        { label: 'Nombre', value: '{{firstName}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'Número de Ticket', value: '{{ticket_id}}' },
        { label: 'Hora', value: '{{hour}}' },
        { label: 'Fecha', value: '{{date}}' }
      ],
      businessHours: [
        { day: 0, label: 'Domingo', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 1, label: 'Lunes', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 2, label: 'Martes', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 3, label: 'Miércoles', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 4, label: 'Jueves', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 5, label: 'Viernes', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 6, label: 'Sábado', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' }
      ],
      messageBusinessHours: null
    }
  },
  methods: {
    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtro:
      if (!variable) {
        return
      }
      // insertar:
      self.txtContent = this.messageBusinessHours
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.messageBusinessHours = self.txtContent
      // mover cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtro:
      if (!emoji.data) {
        return
      }
      // insertar:
      self.txtContent = this.messageBusinessHours
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.messageBusinessHours = self.txtContent
      // mover cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    async listarMensagemHorariosAtendimento () {
      const { data } = await MostrarHorariosAtendiemento()
      this.businessHours = data.businessHours
      this.messageBusinessHours = data.messageBusinessHours
    },
    async salvarHorariosAtendimento () {
      try {
        const { data } = await AtualizarHorariosAtendiemento(this.businessHours)
        this.businessHours = data.businessHours
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: 'Horario de funcionamiento actualizado.'
        })
      } catch (e) {
        console.log('Error en el horario de funcionamiento :' + e)
      }
    },
    async salvarMensagemAusencia () {
      try {
        const { data } = await AtualizarMensagemHorariosAtendiemento({
          messageBusinessHours: this.messageBusinessHours
        })
        this.messageBusinessHours = data.messageBusinessHours
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: 'Mensaje de ausencia actualizado.'
        })
      } catch (e) {
        console.log('Error en el mensaje de ausencia :' + e)
      }
    }
  },
  mounted () {
    this.listarMensagemHorariosAtendimento()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
