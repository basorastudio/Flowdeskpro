<template>

  <q-item
    v-if="!submenu"
    clickable
    v-ripple
    :active="routeName == cRouterName"
    active-class="bg-grey-1 text-grey-8 text-bold menu-link-active-item-top"
    @click=" () => !(routeName == cRouterName) ? $router.push({ name: routeName }) : ''"
    class="houverList menu-list-item full-width"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label class="menu-list-item-title">{{ title }}</q-item-label>
    </q-item-section>
    <q-tooltip v-if="!this.$q.screen.lt.md" anchor="center right" self="center left">
      <div class="menu-list-item-tooltip">
        {{ title }}
      </div>
    </q-tooltip>
  </q-item>

  <q-item
    v-else-if="menuType == 'configuracoes'"
    clickable
    v-ripple
    :active="routeName == cRouterName"
    active-class="bg-grey-1 text-grey-8 text-bold menu-link-active-item-top"
    class="houverList menu-list-item"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : 'eva-settings-2'"/>
    </q-item-section>
    <q-item-section>
      <q-item-label class="menu-list-item-title">{{ title }}</q-item-label>
    </q-item-section>

    <q-menu
      @mouseover="$root.$emit('submenu-mouseover')"
      @mouseout="$root.$emit('submenu-mouseout')"
      @click.stop="$root.$emit('submenu-mouseout')"
      fit
      anchor="bottom right"
      self="top middle"
      ref="menu"
    >
      <q-list>
        <q-item clickable
                @click=" () => !('sessoes' == cRouterName) ? $router.push({ name: 'sessoes' }) : ''">
          <q-item-section>Canales</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('horarioAtendimento' == cRouterName) ? $router.push({ name: 'horarioAtendimento' }) : ''">
          <q-item-section>Horario de Atención</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('api-service' == cRouterName) ? $router.push({ name: 'api-service' }) : ''">
          <q-item-section>API</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('integracoes' == cRouterName) ? $router.push({ name: 'integracoes' }) : ''">
          <q-item-section>Integraciones</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('configuracoes' == cRouterName) ? $router.push({ name: 'configuracoes' }) : ''">
          <q-item-section>Configuraciones</q-item-section>
        </q-item>

      </q-list>
    </q-menu>

    <q-tooltip v-if="!this.$q.screen.lt.md" anchor="center right" self="center left">
      <div class="menu-list-item-tooltip">
        Configuraciones
      </div>
    </q-tooltip>
  </q-item>

  <q-item
    v-else-if="menuType == 'cadastros'"
    clickable
    v-ripple
    :active="routeName == cRouterName"
    active-class="bg-grey-1 text-grey-8 text-bold menu-link-active-item-top"
    class="houverList menu-list-item"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : 'eva-list'"/>
    </q-item-section>
    <q-item-section>
      <q-item-label class="menu-list-item-title">{{ title }}</q-item-label>
    </q-item-section>
    <!--Móvil-->
    <q-menu
      @mouseover="$root.$emit('submenu-mouseover')"
      @mouseout="$root.$emit('submenu-mouseout')"
      @click.stop="$root.$emit('submenu-mouseout')"
      fit
      anchor="bottom right"
      self="top middle"
      ref="menu"
    >
      <q-list>
        <q-item clickable
                @click=" () => !('usuarios' == cRouterName) ? $router.push({ name: 'usuarios' }) : ''">
          <q-item-section>Usuarios</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('filas' == cRouterName) ? $router.push({ name: 'filas' }) : ''">
          <q-item-section>Filas</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('equipes' == cRouterName) ? $router.push({ name: 'equipes' }) : ''">
          <q-item-section>Equipos</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('chat-flow' == cRouterName) ? $router.push({ name: 'chat-flow' }) : ''">
          <q-item-section>Chatbot</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('etiquetas' == cRouterName) ? $router.push({ name: 'etiquetas' }) : ''">
          <q-item-section>Etiquetas</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('protocolos' == cRouterName) ? $router.push({ name: 'protocolos' }) : ''">
          <q-item-section>Protocolos</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('agendamentos' == cRouterName) ? $router.push({ name: 'agendamentos' }) : ''">
          <q-item-section>Agendamientos</q-item-section>
        </q-item>
        <q-item clickable
                @click=" () => !('campanhas' == cRouterName) ? $router.push({ name: 'campanhas' }) : ''">
          <q-item-section>Campaña</q-item-section>
        </q-item>

      </q-list>
    </q-menu>

    <q-tooltip v-if="!this.$q.screen.lt.md" anchor="center right" self="center left">
      <div class="menu-list-item-tooltip">
        Registros
      </div>
    </q-tooltip>
  </q-item>

</template>

<script>
export default {
  name: 'EssentialLink',
  data() {
    return {
      menuAtivo: 'dashboard'
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: ''
    },
    routeName: {
      type: String,
      default: 'dashboard'
    },
    icon: {
      type: String,
      default: ''
    },
    submenu: {
      type: Boolean,
      default: false
    },
    menuType: {
      type: String,
      default: ''
    }
  },
  computed: {
    cRouterName() {
      return this.$route.name
    },
    cRouterNameNew(route) {
      return route
    }
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>
<style lang="sass">
</style>
