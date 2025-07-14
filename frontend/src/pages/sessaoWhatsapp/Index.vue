<template>
  <div v-if="userProfile === 'admin'">
    <div class="bg-white mass-container container-rounded-10">
      <div class="row col full-width q-pa-lg">
      <q-card
        flat
        bordered
        class="full-width"
      >
        <q-card-section class="text-h6 text-bold">
          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-cellphone-wireless q-pr-sm" />
            Canales de Comunicación
          </h2>
          <div class="q-pa-sm">
            <q-btn flat class="generate-button btn-rounded-50"
              icon="eva-plus-outline"
              label="Agregar Canal"
              @click="modalWhatsapp = true"
            />
            <q-btn flat class="generate-button btn-rounded-50"
              icon="mdi-restart"
              label="Reiniciar Conexiones"
              @click="reiniciarConexoes"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="container-border q-ma-lg q-pb-md container-rounded-10">
      <q-card-section>
        <h2 :class="$q.dark.isActive ? ('text-green') : ''">
        <q-icon name="eva-list-outline q-pr-sm" />
        Listado
      </h2>
      </q-card-section>

      <div class="row full-width  q-px-md ">
      <template v-for="item in canais">
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 "
          :key="item.id"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon
                  size="40px"
                  :name="`img:${item.type}-logo.png`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-bold">{{ item.name }}</q-item-label>
              <q-item-label class="text-h6 text-caption">
                {{ item.type }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                flat
                dense
                icon="eva-edit-outline"
                @click="handleOpenModalWhatsapp(item)"
                v-if="isAdmin"
              />
              <!-- <q-btn
            round
            flat
            dense
            icon="delete"
            @click="deleteWhatsapp(props.row)"
            v-if="$store.getters['isSuporte']"
          /> -->
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
          </q-card-section>
          <q-card-section>
            <!-- <q-toggle v-if="item.type === 'whatsapp'" v-model="item.is_open_ia" label="Chat por la IA"
              @input="handleSaveWhatsApp(item)" /> -->
            <q-select
              rounded
              outlined
              dense
              label="ChatBot"
              v-model="item.chatFlowId"
              :options="listaChatFlow"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @input="handleSaveWhatsApp(item)"
            />
          </q-card-section>
          <q-card-section>
            <q-select
              rounded
              outlined
              dense
              label="Fila"
              v-model="item.queueId"
              :options="listaFila"
              map-options
              emit-value
              option-value="id"
              option-label="queue"
              clearable
              @input="handleSaveWhatsApp(item)"
            >
              <q-tooltip>
                Se asignará esta fila a nuevos tickets
              </q-tooltip>
            </q-select>
          </q-card-section>
          <q-card-section>
            <q-select
              rounded
              outlined
              dense
              label="Usuario"
              v-model="item.userId"
              :options="listaUsuario"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @input="handleSaveWhatsApp(item)"
              >
              <q-tooltip>
                Se asignará este usuario a nuevos tickets, el BOT no será activado
              </q-tooltip>
            </q-select>
          </q-card-section>
          <q-card-section>
        <q-checkbox
          v-if="(item.status == 'DISCONNECTED' || item.status == 'qrcode') && item.type == 'whatsapp'"
          v-model="item.importmessages"
          label="Importar mensajes al LEER Código QR"
          @input="handleSaveWhatsApp(item)"
        />
          <q-card-section>
          <DatePick
            v-if="(item.status == 'DISCONNECTED' || item.status == 'qrcode') && item.type == 'whatsapp' && item.importmessages === true"
            rounded
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Fecha de inicio de la importación"
            v-model="item.importOldMessages"
            @input="handleSaveWhatsApp(item)"
            />
          </q-card-section>
          <q-card-section>
          <DatePick
           v-if="(item.status == 'DISCONNECTED' || item.status == 'qrcode') && item.type == 'whatsapp' && item.importmessages === true"
            rounded
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Fecha de fin de la importación"
            v-model="item.importRecentMessages"
            @input="handleSaveWhatsApp(item)"
            />
          </q-card-section>
        <q-checkbox
          v-if="(item.status == 'DISCONNECTED' || item.status == 'qrcode') && item.type == 'whatsapp' && item.importmessages === true"
          v-model="item.importOldMessagesGroups"
          label="Importar mensajes de GRUPO"
          @input="handleSaveWhatsApp(item)"
        />
        <q-checkbox
          v-if="(item.status == 'DISCONNECTED' || item.status == 'qrcode') && item.type == 'whatsapp' && item.importmessages === true"
          v-model="item.closedTicketsPostImported"
          label="Cerrar tickets después de la importación"
          @input="handleSaveWhatsApp(item)"
        />
          </q-card-section>
          <q-separator />
          <q-card-actions
            class="q-gutter-md q-pa-sm q-pt-none"
            align="center"
          >
           <template v-if="item.type !== 'messenger'">
              <q-btn
                v-if="item.type == 'whatsapp' && item.status == 'qrcode'"
                color="primary"
                label="Código QR"
                @click="handleOpenQrModal(item, 'btn-qrCode')"
                icon-right="mdi-qrcode-scan"
                :disable="!isAdmin"
                class="btn-rounded-50 q-mx-sm"
              />

              <div v-if="item.status == 'DISCONNECTED'" class="q-gutter-sm">
                <q-btn
                  v-if="item.type != 'whatsapp'"
                  color="positive"
                  label="Conectar"
                  @click="handleStartWhatsAppSession(item.id)"
                  class="btn-rounded-50 q-mx-sm"
                />
                <q-btn
                  v-if="item.status == 'DISCONNECTED' && item.type == 'whatsapp'"
                  color="primary"
                  label="Nuevo Código QR"
                  @click="handleRequestNewQrCode(item, 'btn-qrCode')"
                  icon-right="mdi-qrcode-scan"
                  :disable="!isAdmin"
                  class="btn-rounded-50 q-mx-sm"
                />

              </div>

              <div v-if="item.status == 'OPENING'" class="row items-center q-gutter-sm flex flex-inline">
                <div class="text-bold">
                  Conectando
                </div>
                <q-spinner-radio color="positive" size="2em" />
                <q-separator vertical spaced="" />
              </div>

              <q-btn
                v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status)"
                color="negative"
                label="Desconectar"
                icon="eva-wifi-off-outline"
                @click="handleDisconectWhatsSession(item.id)"
                :disable="!isAdmin"
                class="btn-rounded-50 q-mx-sm"
              />
            </template>

            <q-btn
              color="negative"
              icon="eva-trash-outline"
              @click="deleteWhatsapp(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
             <q-tooltip>
                Eliminar conexión
              </q-tooltip>
            </q-btn>
    </div>
    <ModalQrCode :abrirModalQR.sync="abrirModalQR" :channel="cDadosWhatsappSelecionado"
      @gerar-novo-qrcode="v => handleRequestNewQrCode(v, 'btn-qrCode')" />
    <ModalWhatsapp :modalWhatsapp.sync="modalWhatsapp" :whatsAppEdit.sync="whatsappSelecionado"
      @recarregar-lista="listarWhatsapps" />
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>

import { DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, ListarWhatsapps, RequestNewQrCode, UpdateWhatsapp, UpdateOpenIAWhatsapp, ReiniciarConexoes } from 'src/service/sessoesWhatsapp'
import { format, parseISO } from 'date-fns'
import es from 'date-fns/locale/es/index'
import ModalQrCode from './ModalQrCode'
import { mapGetters } from 'vuex'
import ModalWhatsapp from './ModalWhatsapp'
import ItemStatusChannel from './ItemStatusChannel'
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarFilas } from 'src/service/filas'
import { ListarUsuarios } from 'src/service/user'

const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ModalQrCode,
    ModalWhatsapp,
    ItemStatusChannel
  },
  data() {
    return {
      userProfile: 'user',
      loading: false,
      userLogado,
      isAdmin: false,
      abrirModalQR: false,
      modalWhatsapp: false,
      whatsappSelecionado: {},
      listaChatFlow: [],
      listaFila: [],
      listaUsuario: [],
      pageNumber: 1,
      hasMore: true,
      whatsAppId: null,
      canais: [],
      objStatus: {
        qrcode: ''
      },
      columns: [
        {
          name: 'name',
          label: 'Nombre',
          field: 'name',
          align: 'left'
        },
        {
          name: 'status',
          label: 'Estado',
          field: 'status',
          align: 'center'
        },
        {
          name: 'session',
          label: 'Sesión',
          field: 'status',
          align: 'center'
        },
        {
          name: 'number',
          label: 'Número',
          field: 'number',
          align: 'center'
        },
        {
          name: 'updatedAt',
          label: 'Última Actualización',
          field: 'updatedAt',
          align: 'center',
          format: d => this.formatarData(d, 'dd/MM/yyyy HH:mm')
        },
        {
          name: 'isDefault',
          label: 'Predeterminado',
          field: 'isDefault',
          align: 'center'
        },
        {
          name: 'acoes',
          label: 'Acciones',
          field: 'acoes',
          align: 'center'
        }
      ],
      FB: {},
      FBscope: {},
      FBLoginOptions: {
        scope:
          'pages_manage_metadata,pages_messaging,instagram_basic,pages_show_list,pages_read_engagement,instagram_manage_messages'
      },
      FBPageList: [],
      fbSelectedPage: { name: null, id: null },
      fbPageName: '',
      fbUserToken: ''
    }
  },
  watch: {
    whatsapps: {
      handler() {
        this.canais = JSON.parse(JSON.stringify(this.whatsapps))
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cFbAppId() {
      return process.env.FACEBOOK_APP_ID
    },
    cDadosWhatsappSelecionado() {
      const { id } = this.whatsappSelecionado
      return this.whatsapps.find(w => w.id === id)
    }
  },
  methods: {
    async reiniciarConexoes() {
      try {
        await ReiniciarConexoes()

        this.$q.notify({
          type: 'positive',
          message: '¡Conexiones reiniciadas con éxito!'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: '¡Error al reiniciar conexiones!'
        })
        console.error(error)
      }
    },
    formatarData(data, formato) {
      return format(parseISO(data), formato, { locale: es })
    },
    handleSdkInit({ FB }) {
      this.FB = FB
      // try login

      // this.FBscope = scope
    },
    async changeIaOption(whatsapp) {
      const data = { is_open_ia: whatsapp.is_open_ia, queurId: whatsapp.queue_transf }
      await UpdateOpenIAWhatsapp(whatsapp.id, data)
    },
    async buscaFilas() {
      const { data } = await ListarFilas()
      this.listaFila = data.filter(f => f.isActive)
    },
    async listarUsuario() {
      try {
        const { data } = await ListarUsuarios({ pageNumber: this.pageNumber })

        this.listaUsuario = [...this.listaUsuario, ...data.users]
        this.hasMore = data.hasMore

        // Si aún hay más usuarios, incrementa la página y llama de nuevo
        if (this.hasMore) {
          this.pageNumber += 1
          this.listarUsuario()
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      }
    },
    handleOpenQrModal(channel) {
      this.whatsappSelecionado = channel
      this.abrirModalQR = true
    },
    handleOpenModalWhatsapp(whatsapp) {
      this.whatsappSelecionado = whatsapp
      this.modalWhatsapp = true
    },
    async handleDisconectWhatsSession(whatsAppId) {
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea desconectar? ',
        // message: 'Mensajes antiguos no serán borrados en el whatsapp.',
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeleteWhatsappSession(whatsAppId).then(() => {
          const whatsapp = this.whatsapps.find(w => w.id === whatsAppId)
          this.$store.commit('UPDATE_WHATSAPPS', {
            ...whatsapp,
            status: 'DISCONNECTED'
          })
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async handleStartWhatsAppSession(whatsAppId) {
      try {
        await StartWhatsappSession(whatsAppId)
      } catch (error) {
        console.error(error)
      }
    },

    async handleRequestNewQrCode(channel, origem) {
      if (channel.type === 'telegram' && !channel.tokenTelegram) {
        this.$notificarErro('Es necesario proporcionar el token para Telegram')
      }
      this.loading = true
      try {
        await RequestNewQrCode({ id: channel.id, isQrcode: true })
        setTimeout(() => {
          this.handleOpenQrModal(channel)
        }, 2000)
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    },
    async listarWhatsapps() {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async deleteWhatsapp(whatsapp) {
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea eliminar? ',
        message: 'No es buena idea borrar si ya ha generado atenciones para este whatsapp.',
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarWhatsapp(whatsapp.id).then(r => {
          this.$store.commit('DELETE_WHATSAPPS', whatsapp.id)
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async listarChatFlow() {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async handleSaveWhatsApp(whatsapp) {
      try {
        await UpdateWhatsapp(whatsapp.id, whatsapp)
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `¡Whatsapp ${whatsapp.id ? 'editado' : 'creado'} con éxito!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        return this.$q.notify({
          type: 'error',
          progress: true,
          position: 'top',
          message: '¡Ups! Verifica los errores... El nombre de la conexión no puede existir en la plataforma, es un identificador único.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    },
    handleUpdateSession(session) {
      this.$store.commit('UPDATE_SESSION', session)
      this.atualizarPagina()
    },
    atualizarPagina() {
      location.reload()
    }
  },
  beforeDestroy() {
    this.$root.$off('UPDATE_SESSION', this.handleUpdateSession)
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
    this.isAdmin = localStorage.getItem('profile')
    this.buscaFilas()
    this.listarUsuario()
    this.listarWhatsapps()
    this.listarChatFlow()
    this.$root.$on('UPDATE_SESSION', this.handleUpdateSession)
  }
  // destroyed() {
  //   this.disconnectSocket()
  // }
}
</script>

<style lang="scss" scoped></style>
