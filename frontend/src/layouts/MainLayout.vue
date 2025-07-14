<template>
  <div>
    <q-layout view="hHh Lpr lFf">

      <div class="header-mobile"
           v-if="this.$q.screen.lt.md">

        <q-btn
          color="white"
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menú"
          icon="menu"
          size="lg"
          class="menu-icon-mobile">
        </q-btn>

      </div>

      <div class="header" v-if="$route.name !== 'chat-interno' && $route.name !== 'atendimento' && $route.name !== 'chat-empty' && $route.name !== 'chat' && $route.name !== 'chat-contatos'"
           bordered
           :class="{'header-buttons-mobile': this.$q.screen.lt.md}"
      >
        <q-toolbar
        >

          <div class="q-gutter-sm row items-center no-wrap">

            <q-btn
              dense
              flat
              @click="toggleSilentMode"
              :icon="isSilentMode ? 'volume_off' : 'volume_up'"
              :color="isSilentMode ? 'red' : 'green'"
              size="xl"
              class="header-buttons"
            >
              <q-tooltip>
                {{ isSilentMode ? 'Modo Silencioso Activado' : 'Modo Silencioso Desactivado' }}
              </q-tooltip>
            </q-btn>

            <q-btn
              dense
              flat
              icon="notifications"
              class="header-buttons" size="xl"
            >
              <q-badge color="red"
                       text-color="white"
                       floating
                       v-if="(this.notificacaoInternaNaoLida + parseInt(notifications_p.count)) > 0 || delayed > 0 || venceHoje > 0">
                {{ this.notificacaoInternaNaoLida + parseInt(notifications_p.count) + delayed + venceHoje }}
              </q-badge>
              <q-menu>
                <q-list style="min-width: 300px">
                  <q-item v-if="(parseInt(notifications.count) + parseInt(notifications_p.count)) == 0 && delayed == 0 && venceHoje == 0">
                    <q-item-section style="cursor: pointer;">
                      ¡Nada nuevo por aquí!
                    </q-item-section>
                  </q-item>

                  <q-item v-if="parseInt(notificacoesChat) > 0">
                    <q-item-section avatar @click="() => $router.push({ name: 'interno' })" style="cursor: pointer;">
                      <q-avatar style="width: 60px; height: 60px" color="primary" text-color="white">
                        {{ notificacoesChat }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section @click="() => $router.push({ name: 'chat-interno' })" style="cursor: pointer;">
                      ¡Nuevos mensajes no leídos en el chat interno!
                    </q-item-section>
                  </q-item>

                  <q-item v-if="parseInt(notificacaoInternaNaoLida) > 0">
                    <q-item-section avatar @click="() => $router.push({ name: 'interno' })" style="cursor: pointer;">
                      <q-avatar style="width: 60px; height: 60px" color="primary" text-color="white">
                        {{ notificacaoInternaNaoLida }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section @click="() => $router.push({ name: 'chat-interno' })" style="cursor: pointer;">
                      ¡Mensajes no leídos en el chat interno!
                    </q-item-section>
                  </q-item>

                  <q-item v-if="parseInt(notifications_p.count) > 0">
                    <q-item-section avatar @click="() => $router.push({ name: 'atendimento' })" style="cursor: pointer;">
                      <q-avatar style="width: 60px; height: 60px" color="primary" text-color="white">
                        {{ notifications_p.count }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section @click="() => $router.push({ name: 'atendimento' })" style="cursor: pointer;">
                      Clientes pendientes en la fila
                    </q-item-section>
                  </q-item>

                  <q-item v-if="delayed > 0">
                    <q-item-section avatar @click="() => $router.push({ name: 'tarefas' })" style="cursor: pointer;">
                      <q-avatar style="width: 60px; height: 60px" color="red" text-color="white">
                        {{ delayed }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section @click="() => $router.push({ name: 'tarefas' })" style="cursor: pointer;">
                      ¡Hay {{ delayed }} tarea(s) atrasada(s)!
                    </q-item-section>
                  </q-item>

                  <q-item v-if="venceHoje > 0">
                    <q-item-section avatar @click="() => $router.push({ name: 'tarefas' })" style="cursor: pointer;">
                      <q-avatar style="width: 60px; height: 60px" color="orange" text-color="white">
                        {{ venceHoje }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section @click="() => $router.push({ name: 'tarefas' })" style="cursor: pointer;">
                      ¡Hay {{ venceHoje }} tarea(s) que vence(n) hoy!
                    </q-item-section>
                  </q-item>

                </q-list>
              </q-menu>
              <q-tooltip>Notificaciones</q-tooltip>
            </q-btn>

            <q-btn  flat
                    class="header-buttons" size="lg">
              <q-avatar :color="usuario.status === 'offline' ? 'negative' : 'positive'"
                        text-color="white"
                        size="25px"
                        :icon="usuario.status === 'offline' ? 'mdi-account-off' : 'mdi-account-check'"
                        rounded
              >
              </q-avatar>

              <q-menu>
                <q-list style="min-width: 100px">
                  <cStatusUsuario @update:usuario="atualizarUsuario"
                                  :usuario="usuario" />

                </q-list>
              </q-menu>

              <q-tooltip>
                {{ usuario.status === 'offline' ? 'Usuario Offline' : 'Usuario Online' }}
              </q-tooltip>
            </q-btn>

            <q-btn
              flat
              class="header-buttons" size="lg">
              <q-avatar size="sm">
                {{ $iniciaisString(username) }}
              </q-avatar>
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item-label header> ¡Hola! <b> {{ username }} </b> </q-item-label>
                  <q-item clickable
                          v-close-popup
                          @click="abrirModalUsuario">
                    <q-item-section>Perfil</q-item-section>
                  </q-item>
                  <q-item clickable
                          v-close-popup
                          @click="efetuarLogout">
                    <q-item-section>Salir</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <vencimento />
                      <cSystemVersion  />
                    </q-item-section>
                  </q-item>

                </q-list>
              </q-menu>

              <q-tooltip>Usuario</q-tooltip>
            </q-btn>

          </div>
        </q-toolbar>
      </div>

      <q-drawer v-model="leftDrawerOpen"
                show-if-above
                bordered
                :mini="miniState"
                @mouseover="miniState = false"
                @mouseout="miniState = true"
                @mouseover.stop="miniState = false"
                mini-to-overlay
                :content-class="$q.dark.isActive ? 'bg-black' : 'container-menu'">

        <q-scroll-area class="fit">
          <q-list padding :key="userProfile">
            <EssentialLink v-for="item in menuData" :key="item.title" v-bind="item" />
            <div v-if="userProfile === 'admin'">
              <q-separator spaced />
              <div class="q-mb-lg"></div>
              <EssentialLink v-if="exibirMenuEmpresas(item)"
                             :key="Empresas"
                             v-bind="{
                  title: 'Empresas',
                  caption: 'Configuraciones del SaaS',
                  icon: 'mdi-office-building',
                  routeName: 'empresas',
                }" />
              <!-- <q-item-label header>Administración</q-item-label> -->
              <template v-for="item in menuDataAdmin">
                <EssentialLink v-if="exibirMenuBeta(item)" :key="item.title" v-bind="item" />
              </template>
              <EssentialLink v-if="exibirMenuBeta(item)"
                             :key="Configuraciones"
                             @submenu-mouseover="miniState = false"
                             @submenu-mouseout="miniState = true"
                             v-bind="{
                  title: 'Registros',
                  caption: 'Registros del sistema',
                  icon: 'mdi-list',
                  routeName: 'cadastros',
                  submenu: true,
                  menuType: 'cadastros'

                }" />
              <EssentialLink v-if="exibirMenuBeta(item)"
                             :key="Configuraciones"
                             @submenu-mouseover="miniState = false"
                             @submenu-mouseout="miniState = true"
                             v-bind="{
                  title: 'Configuraciones',
                  caption: 'Configuraciones del sistema',
                  icon: 'mdi-settings-2',
                  routeName: 'configuracoes',
                  submenu: true,
                  menuType: 'configuracoes'

                }" />
              <q-separator spaced />
            </div>

          </q-list>
        </q-scroll-area>

        <div class="absolute-bottom text-center row justify-start"
             :class="{ 'bg-grey-3': $q.dark.isActive }"
             style="height: 40px">
          <q-toggle size="xl"
                    keep-color
                    dense
                    class="text-bold q-ml-xs"
                    :class="$q.dark.isActive ? 'bg-black full-width' : ''"
                    :icon-color="$q.dark.isActive ? 'black' : 'white'"
                    :value="$q.dark.isActive"
                    :color="$q.dark.isActive ? 'grey-3' : 'black'"
                    checked-icon="mdi-white-balance-sunny"
                    unchecked-icon="mdi-weather-sunny"
                    @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })">
            <q-tooltip content-class="text-body1 hide-scrollbar">
              {{ $q.dark.isActive ? 'Desactivar' : 'Activar' }} Modo Oscuro (Dark Mode)
            </q-tooltip>
          </q-toggle>
        </div>
      </q-drawer>

      <q-page-container>
        <informative />
        <q-page class="q-pa-xs">
          <router-view />
        </q-page>
      </q-page-container>
      <audio ref="audioNotification">
        <source :src="currentAlertSound" type="audio/mp3">
      </audio>
      <ModalUsuario :isProfile="true"
                    :modalUsuario.sync="modalUsuario"
                    :usuarioEdicao.sync="usuario" />
    </q-layout>

  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
import cSystemVersion from '../components/cSystemVersion.vue'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { ConsultarResumoTarefas } from 'src/service/tarefas'
import EssentialLink from 'components/EssentialLink.vue'
import socketInitial from './socketInitial'
import alertSound from 'src/assets/sound.mp3'
import silenceSound from 'src/assets/silence.mp3'
import alertInterno from 'src/assets/chatInterno.mp3'
import { format } from 'date-fns'
const username = localStorage.getItem('username')
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { RealizarLogout } from 'src/service/login'
import cStatusUsuario from '../components/cStatusUsuario.vue'
import vencimento from '../components/vencimento.vue'
import informative from '../components/informative.vue'
import { socketIO } from 'src/utils/socket'
import { ConsultarTickets } from 'src/service/tickets'
import { listCountUnreadMessage } from 'src/service/chatInterno'
const socket = socketIO()

const objMenu = [
  {
    title: 'Dashboard',
    caption: '',
    icon: 'mdi-home',
    routeName: 'home-dashboard'
  },
  {
    title: 'Atenciones',
    caption: 'Lista de atenciones',
    icon: 'mdi-whatsapp',
    routeName: 'chat-empty'
  },
  {
    title: 'Contactos',
    caption: 'Lista de contactos',
    icon: 'mdi-card-account-mail',
    routeName: 'contatos'
  },
  {
    title: 'Chat Interno',
    caption: 'Chat',
    icon: 'mdi-forum-outline',
    routeName: 'chat-interno'
  },
  {
    title: 'Mensajes Rápidos',
    caption: 'Mensajes predefinidos',
    icon: 'mdi-reply-all-outline',
    routeName: 'mensagens-rapidas'
  },
  {
    title: 'Tareas',
    caption: 'Tareas',
    icon: 'mdi-clipboard-list-outline',
    routeName: 'tarefas'
  },
  {
    title: 'Despedida',
    caption: 'Mensajes de despedida',
    icon: 'mdi-message-bulleted-off',
    routeName: 'despedida'
  },
  {
    title: 'Ayuda',
    caption: 'Ayuda',
    icon: 'mdi-help',
    routeName: 'ajuda'
  }
]

const objMenuAdmin = [
  {
    title: 'Panel Atenciones',
    caption: 'Vista general de las atenciones',
    icon: 'mdi-view-dashboard-variant',
    routeName: 'painel-atendimentos'
  },
  {
    title: 'Informes',
    caption: 'Informes generales',
    icon: 'mdi-file-chart',
    routeName: 'relatorios'
  },
 // {
 //   title: 'Financiero',
 //   caption: 'Financiero',
 //   icon: 'mdi-cash-multiple',
 //   routeName: 'financeiro'
 // }
]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario, cStatusUsuario, cSystemVersion, vencimento, informative },
  data () {
    return {
      delayed: 0,
      venceHoje: 0,
      whatsappId: null,
      username,
      domainExperimentalsMenus: ['@'],
      miniState: true,
      userProfile: 'user',
      modalUsuario: false,
      usuario: {},
      isSilentMode: false,
      alertSound,
      alertInterno,
      silenceSound,
      leftDrawerOpen: false,
      menuData: objMenu,
      menuDataAdmin: objMenuAdmin,
      countTickets: 0,
      ticketsList: [],
      notificacaoInternaNaoLida: ''
    }
  },
  computed: {
    currentAlertSound() {
      return this.isSilentMode ? this.silenceSound : this.alertSound
    },
    ...mapGetters(['notifications', 'notifications_p', 'whatsapps', 'showMenu', 'chatFocado', 'notificacaoChatInterno', 'notificacoesChat', 'notificacaoTicket']),
    cProblemaConexao () {
      const idx = this.whatsapps.findIndex(w =>
        ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status)
      )
      return idx !== -1
    },
    cQrCode () {
      const idx = this.whatsapps.findIndex(
        w => w.status === 'qrcode' || w.status === 'DESTROYED'
      )
      return idx !== -1
    },
    cOpening () {
      const idx = this.whatsapps.findIndex(w => w.status === 'OPENING')
      return idx !== -1
    },
    cUsersApp () {
      return this.$store.state.usersApp
    },
    cObjMenu () {
      if (this.cProblemaConexao) {
        return objMenu.map(menu => {
          if (menu.routeName === 'sessoes') {
            menu.color = 'negative'
          }
          return menu
        })
      }
      return objMenu
    }
  },
  watch: {
    notificacaoChatInterno: {
      handler() {
        if (this.$router.currentRoute.fullPath.indexOf('atendimento-Interno') < 0 || !this.chatFocado.id || this.chatFocado.id !== this.notificacaoChatInterno.senderId) {
          this.$store.commit('LISTA_NOTIFICACOES_CHAT_INTERNO', { action: 'update', data: 1 })
          this.listarMensagens()
          const audio = new Audio(alertInterno)
          audio.play()
        }
      }
    },
    notificacaoTicket: {
      handler() {
        this.$nextTick(() => {
          this.$refs.audioNotification.play()
        })
      }
    }
  },
  methods: {
    toggleSilentMode() {
      this.isSilentMode = !this.isSilentMode
      localStorage.setItem('silentMode', this.isSilentMode)
      window.location.reload()
    },
    async getTaskSummary() {
      const owner = localStorage.getItem('username')
      try {
        const response = await ConsultarResumoTarefas({ owner })
        this.delayed = response.data.delayed
        this.venceHoje = response.data.venceHoje
      } catch (error) {
        console.error('Error al consultar resumen de tareas:', error)
      }
    },
    async listarMensagens() {
      try {
        const { data } = await listCountUnreadMessage(this.usuario.userId)
        this.notificacaoInternaNaoLida = data.count
      } catch (e) {

      }
    },
    reloadPage() {
      window.location.reload()
    },
    exibirMenuBeta(itemMenu) {
      if (!itemMenu?.isBeta) return true
      for (const domain of this.domainExperimentalsMenus) {
        if (this.usuario.email.indexOf(domain) !== -1) return true
      }
      return false
    },
    exibirMenuEmpresas(itemMenu) {
      const user = JSON.parse(localStorage.getItem('usuario'))
      if (user.tenantId != 1) {
        return false
      }
      return true
    },
    async listarWhatsapps() {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    validaTelaAdmin(itemMenu) {
      const user = JSON.parse(localStorage.getItem('usuario'))
      if (itemMenu.routeName === 'empresas' && user.tenantId != 1) return false
      return true
    },
    handlerNotifications(data) {
      const { body, contact, ticket } = data
      console.log(data)
      if ('Notification' in window && Notification.permission === 'granted') {
        const options = {
          body: `${body} - ${format(new Date(), 'HH:mm')}`,
          icon: contact.profilePicUrl,
          tag: ticket.id,
          renotify: true
        }

        const notification = new Notification(
          `Mensaje de ${contact.name}`,
          options
        )

        notification.onclick = e => {
          e.preventDefault()
          window.focus()
          this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$router.push({ name: 'atendimento' })
        }

        this.$nextTick(() => {
          this.$refs.audioNotification.play()
        })
      }
    },
    async abrirModalUsuario () {
      this.modalUsuario = true
    },
    async efetuarLogout () {
      try {
        await RealizarLogout(this.usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')

        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro('No fue posible realizar logout', error)
      }
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    },
    conectarSocket (usuario) {
      socket.on(`${usuario.tenantId}:chat:updateOnlineBubbles`, data => {
        this.$store.commit('SET_USERS_APP', data)
      })
    },
    atualizarUsuario () {
      this.usuario = JSON.parse(localStorage.getItem('usuario'))
      if (this.usuario.status === 'offline') {
        socket.emit(`${this.usuario.tenantId}:setUserIdle`)
      }
      if (this.usuario.status === 'online') {
        socket.emit(`${this.usuario.tenantId}:setUserActive`)
      }
    },
    async consultarTickets () {
      const params = {
        searchParam: '',
        pageNumber: 1,
        status: ['open'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: true,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
        // date: new Date(),
      }
      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // total de tickets en el estado
        // this.ticketsList = data.tickets
        // console.log(data)
        this.$store.commit('UPDATE_NOTIFICATIONS', data)
        setTimeout(() => {
          this.$store.commit('UPDATE_NOTIFICATIONS', data)
        }, 500)
        // this.$store.commit('SET_HAS_MORE', data.hasMore)
        // console.log(this.notifications)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
      const params2 = {
        searchParam: '',
        pageNumber: 1,
        status: ['pending'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
        // date: new Date(),
      }
      try {
        const { data } = await ConsultarTickets(params2)
        this.countTickets = data.count // total de tickets en el estado
        // this.ticketsList = data.tickets
        // console.log(data)
        this.$store.commit('UPDATE_NOTIFICATIONS_P', data)
        setTimeout(() => {
          this.$store.commit('UPDATE_NOTIFICATIONS_P', data)
        }, 500)
        // this.$store.commit('SET_HAS_MORE', data.hasMore)
        // console.log(this.notifications)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
    }
  },
  async mounted () {
    this.$root.$on('submenu-mouseover', () => {
      this.miniState = false
    })
    this.$root.$on('submenu-mouseout', () => {
      this.miniState = true
    })
    const savedSilentMode = localStorage.getItem('silentMode')
    if (savedSilentMode !== null) {
      this.isSilentMode = JSON.parse(savedSilentMode)
    }
    this.getTaskSummary()
    this.atualizarUsuario()
    await this.listarWhatsapps()
    await this.listarConfiguracoes()
    await this.consultarTickets()
    await this.listarMensagens()
    this.socket.on('disconnect', () => {
      console.log('Socket desconectado. Intentando reconectar...')
      this.socket.connect()
    })
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission()
      }

      this.usuario = JSON.parse(localStorage.getItem('usuario'))
      this.userProfile = localStorage.getItem('profile')

      await this.conectarSocket(this.usuario)

      this.atualizarUsuario()
      await this.listarWhatsapps()
      await this.listarConfiguracoes()
      await this.consultarTickets()

      this.socket.on('chat:update', this.handlerNotifications)
    }
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    await this.conectarSocket(this.usuario)
  },
  destroyed () {
    socket.disconnect()
  }
}
</script>
<style scoped>
.q-img__image {
  background-size: contain;
}

</style>
