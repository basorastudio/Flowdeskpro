<template>
  <div>
    <q-item>
      <q-item-section avatar>
        <q-icon v-if="item.status == 'qrcode'"
          color="primary"
          name="mdi-crop-free"
          size="2.5em" />
        <q-icon v-if="item.status == 'DISCONNECTED'"
          color="negative"
          size="2.5em"
          name="mdi-wifi-alert" />
        <q-icon name="mdi-wifi-arrow-up-down"
          color="green-8"
          size="2.5em"
          v-if="item.status == 'CONNECTED'" />
        <q-icon v-if="['PAIRING', 'TIMEOUT'].includes(item.status)"
          color="negative"
          size="2.5em"
          name="mdi-wifi-strength-1-alert" />
        <q-spinner v-if="item.status == 'OPENING'"
          color="green-7"
          size="3em"
          :thickness="2" />
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="item.status == 'qrcode'">
          <span class="text-weight-medium"> Esperando la lectura del código QR </span>
          <span class="row col"> Haga clic en el botón 'Código QR' y lea el código QR con su teléfono para iniciar la sesión
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'DISCONNECTED'">
          <span class="text-weight-medium"> No se pudo comenzar la comunicación para este canal. </span>
          <span class="row col"
            v-if="item.type === 'whatsapp'"> Asegúrese de que su teléfono esté conectado a Internet e intente
 De nuevo, o solicite un nuevo código QR </span>
          <span class="row col"
            v-if="item.type === 'telegram'"> Intenta conectarte de nuevo. Si el error permanece, confirme si el token es
 correcto.</span>
          <span class="row col"
            v-if="item.type === 'instagram'"> Intenta conectarte de nuevo. Si el error permanece, confirme si el
 Las credenciales son correctas.</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED'">
          <span class="text-weight-medium"> ¡Conexión establecida! </span>
        </q-item-label>
        <q-item-label v-if="['PAIRING', 'TIMEOUT'].includes(item.status)">
          <span class="text-weight-medium"> La conexión con el teléfono celular se perdió </span>
          <span class="row col"> Asegúrese de que su teléfono esté conectado a Internet y WhatsApp esté
 Abra o haga clic en el botón 'Desconectar' para obtener un nuevo código QR </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'OPENING'">
          <span class="text-weight-medium"> Establecimiento de conexión. </span>
          <span class="row col"> Esto puede llevar un tiempo ... </span>
        </q-item-label>
        <q-item-label caption>
          Última actualización: {{ formatarData(item.updatedAt, 'dd/MM/yyyy HH:mm') }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>
<script>
import { format, parseISO } from 'date-fns'
import es from 'date-fns/locale/es/index'

export default {
  name: 'ItemStatusChannel',
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: es })
    }
  }
}
</script>
