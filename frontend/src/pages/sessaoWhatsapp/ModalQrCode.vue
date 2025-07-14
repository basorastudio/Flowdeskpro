<template>
  <q-dialog :value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent>
    <q-card class="container-rounded-10">
      <q-card-section>
        <div class="text-h6 font-family-main text-center">
          Lea el Código QR para iniciar la sesión
          <q-btn round
          flat
            class="q-ml-md float-right"
            color="negative"
            icon="eva-close"
            @click="fecharModalQrModal" />
        </div>
      </q-card-section>
      <q-card-section class="text-center q-ma-lg container-rounded-10 container-border"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <QrcodeVue v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H" />
        <span v-else>
        <span style="font-size: 10px">
          Esperando la lectura del Código QR ...
        </span>
      </q-card-section>
      <q-card-section>
        <div class="text-center q-mb-lg" style="font-size: 14px">Si tiene un problema con la lectura, solicite un nuevo Código QR </div>
        <div class="row col-12 justify-center">
          <q-btn
            class="generate-button btn-rounded-50"
            label="Nuevo código QR"
            @click="solicitarQrCode"
            icon="mdi-qrcode" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>

import QrcodeVue from 'qrcode.vue'

export default {
  name: 'ModalQrCode',
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => ({
        id: null,
        qrcode: ''
      })
    }
  },
  watch: {
    channel: {
      handler (v) {
        if (this.channel.status === 'CONNECTED') {
          this.fecharModalQrModal()
        }
      },
      deep: true
    }
  },
  computed: {
    cQrcode () {
      return this.channel.qrcode
    }
  },
  methods: {
    solicitarQrCode () {
      this.$emit('gerar-novo-qrcode', this.channel)
      this.fecharModalQrModal()
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    },
    fecharModalQrModal () {
      this.$emit('update:abrirModalQR', false)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
