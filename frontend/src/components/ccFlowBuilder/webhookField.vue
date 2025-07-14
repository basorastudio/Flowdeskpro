<template>
  <div>
    <q-card flat
      class="q-pa-sm q-pb-md">
      <q-card-section class="q-pa-none">
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
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
          <textarea ref="inputEnvioMensagem"
            style="min-height: 10vh; max-height: 30vh; flex: auto"
            class="q-pa-sm bg-white"
            placeholder="Añade el Webhook (GET)"
            autogrow
            dense
            outlined
            @input="(v) => $attrs.element.data.webhook = v.target.value"
            :value="$attrs.element.data.webhook">
          </textarea>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>

export default {
  name: 'WebhookField',
  data () {
    return {
      variaveis: [
        { label: 'Nombre Completo', value: '{{name}}' },
        { label: 'Nombre', value: '{{firstName}}' },
        { label: 'Saludo', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'Teléfono', value: '{{phoneNumber}}' },
        { label: 'Email de Contacto', value: '{{email}}' },
        { label: 'Número de Ticket', value: '{{ticket_id}}' },
        { label: 'Hora', value: '{{hour}}' },
        { label: 'Fecha', value: '{{date}}' },
        { label: 'Fila', value: '{{fila}}' },
        { label: 'Nombre del agente', value: '{{user}}' },
        { label: 'Email del agente', value: '{{userEmail}}' }
      ]
    }
  },
  methods: {
    onInsertSelectVariable (variable) {
      console.log('onInsertSelectVariable', variable)
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // obtener la posición del cursor:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filtro:
      if (!variable) {
        return
      }
      // insertar:
      self.txtContent = this.$attrs.element.data.webhook
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.webhook = self.txtContent
      // mover el cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
