<template>
  <q-dialog
    :value="modalQrCode"
    @hide="fecharModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 450px"
    >
      <q-card-section class="text-center">
        <div class="text-h6 q-mb-md">
          <q-icon
            size="40px"
            class="q-mr-md"
            name="img:baileys-logo.png"
          />
          Conectar Baileys Plus
        </div>
        
        <q-banner
          inline-actions
          icon="smartphone"
          class="text-white bg-green q-mb-md"
        >
          Escaneá el código QR con tu WhatsApp
          <template v-slot:action>
            <q-btn
              flat
              label="¿Cómo?"
              @click="showHelp = true"
            />
          </template>
        </q-banner>
      </q-card-section>

      <q-card-section class="text-center">
        <div v-if="qrCodeData && status !== 'CONNECTED'">
          <div class="q-mb-md">
            <q-img
              :src="qrCodeData"
              style="width: 280px; height: 280px; border-radius: 10px;"
              class="q-mx-auto"
            >
              <template v-slot:loading>
                <q-spinner-grid
                  color="primary"
                  size="40px"
                />
              </template>
            </q-img>
          </div>
          
          <q-linear-progress
            :value="progress"
            color="green"
            track-color="grey-3"
            class="q-mb-md"
          />
          
          <div class="text-caption text-grey-7">
            Intento {{ retries }}/5 • {{ timeLeft }}s para nuevo QR
          </div>
        </div>

        <div v-else-if="status === 'CONNECTED'" class="text-center">
          <q-icon
            name="check_circle"
            color="green"
            size="80px"
            class="q-mb-md"
          />
          <div class="text-h6 text-green">¡Conectado exitosamente!</div>
          <div class="text-caption text-grey-7 q-mt-sm">
            Tu WhatsApp está conectado con Baileys Plus
          </div>
        </div>

        <div v-else-if="status === 'OPENING'" class="text-center">
          <q-spinner-grid
            color="primary"
            size="80px"
            class="q-mb-md"
          />
          <div class="text-h6">Iniciando conexión...</div>
          <div class="text-caption text-grey-7">
            Preparando Baileys Plus
          </div>
        </div>

        <div v-else class="text-center">
          <q-icon
            name="error"
            color="red"
            size="80px"
            class="q-mb-md"
          />
          <div class="text-h6 text-red">Error de conexión</div>
          <div class="text-caption text-grey-7">
            No se pudo establecer la conexión
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          v-if="status === 'CONNECTED'"
          color="green"
          label="Cerrar"
          @click="fecharModal"
        />
        <q-btn
          v-else
          color="grey"
          label="Cancelar"
          @click="fecharModal"
        />
        <q-btn
          v-if="status !== 'CONNECTED' && status !== 'OPENING'"
          color="primary"
          label="Reintentar"
          @click="retryConnection"
        />
      </q-card-actions>
    </q-card>

    <!-- Modal de ayuda -->
    <q-dialog v-model="showHelp">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">¿Cómo escanear el QR?</div>
        </q-card-section>
        
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">1</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Abre WhatsApp en tu teléfono</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">2</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Ve a Configuración > Dispositivos conectados</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">3</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Toca "Conectar un dispositivo"</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">4</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Escanea este código QR</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Entendido" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
import { baileysQR, baileysStatus } from 'src/service/baileys'

export default {
  name: 'ModalQrCodeBaileys',
  props: {
    modalQrCode: {
      type: Boolean,
      default: false
    },
    whatsappId: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    return {
      qrCodeData: null,
      status: 'OPENING',
      retries: 0,
      progress: 0,
      timeLeft: 30,
      showHelp: false,
      intervalQR: null,
      intervalStatus: null,
      intervalTimer: null
    }
  },
  watch: {
    modalQrCode (newVal) {
      if (newVal) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    }
  },
  methods: {
    async fetchQRCode () {
      try {
        const { data } = await baileysQR(this.whatsappId)
        if (data.success && data.qr) {
          this.qrCodeData = data.qr
          this.status = data.status
          this.startTimer()
        }
      } catch (error) {
        console.error('Error fetching QR:', error)
      }
    },

    async fetchStatus () {
      try {
        const { data } = await baileysStatus(this.whatsappId)
        this.status = data.status
        this.retries = data.retries || 0
        
        if (data.status === 'CONNECTED') {
          this.stopPolling()
          setTimeout(() => {
            this.$emit('connected')
          }, 2000)
        }
      } catch (error) {
        console.error('Error fetching status:', error)
      }
    },

    startPolling () {
      this.fetchQRCode()
      this.fetchStatus()
      
      this.intervalQR = setInterval(() => {
        if (this.status !== 'CONNECTED') {
          this.fetchQRCode()
        }
      }, 30000) // Cada 30 segundos

      this.intervalStatus = setInterval(() => {
        this.fetchStatus()
      }, 3000) // Cada 3 segundos
    },

    stopPolling () {
      if (this.intervalQR) {
        clearInterval(this.intervalQR)
        this.intervalQR = null
      }
      if (this.intervalStatus) {
        clearInterval(this.intervalStatus)
        this.intervalStatus = null
      }
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer)
        this.intervalTimer = null
      }
    },

    startTimer () {
      this.timeLeft = 30
      this.progress = 0
      
      this.intervalTimer = setInterval(() => {
        this.timeLeft--
        this.progress = (30 - this.timeLeft) / 30
        
        if (this.timeLeft <= 0) {
          clearInterval(this.intervalTimer)
          this.intervalTimer = null
        }
      }, 1000)
    },

    retryConnection () {
      this.stopPolling()
      this.qrCodeData = null
      this.status = 'OPENING'
      this.startPolling()
    },

    fecharModal () {
      this.stopPolling()
      this.$emit('fecharModal')
    }
  },

  beforeDestroy () {
    this.stopPolling()
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 15px;
}
</style>
