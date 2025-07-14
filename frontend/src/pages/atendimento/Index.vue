<template>
  <div
    class="WAL position-relative bg-grey-3"
    :style="style"
  >
    <q-layout
      container
      view="lHr LpR lFr"
    >
      <q-drawer
        v-model="drawerTickets"
        @hide="drawerTickets = false"
        show-if-above
        :overlay="$q.screen.lt.md"
        persistent
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 380"
        content-class="hide-scrollbar full-width"
      >
        <q-toolbar class="q-pr-none menu-header menu-left q-gutter-xs full-width" style="height: 64px">
          <q-btn
            flat
            class="chat-button-avatar" size="lg">
            <q-avatar size="sm">
              {{ $iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header> ¡Hola! <b> {{ username }} </b> </q-item-label>
                <cStatusUsuario @update:usuario="actualizarUsuario"
                  :usuario="usuario" />
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
              </q-list>
            </q-menu>

            <q-tooltip>Usuario</q-tooltip>
          </q-btn>
          <q-space />

          <q-btn flat class="btn-rounded" :class="$q.dark.isActive ? 'text-green bg-black' : ''" :icon="isSilentMode ? 'volume_off' : 'volume_up'" @click="toggleSilentMode" :disable="loadingMount">
            <q-tooltip content-class="text-bold"> {{ isSilentMode ? 'Modo Silencioso Activado' : 'Modo Silencioso Desactivado' }} </q-tooltip>
          </q-btn>

          <q-btn flat class="btn-rounded" :class="$q.dark.isActive ? 'text-green bg-black' : ''" icon="eva-message-circle-outline" @click="() => $router.push({ name: 'chat-interno' })" :disable="loadingMount">
            <q-tooltip content-class="text-bold"> Chat Interno </q-tooltip>
            <q-badge v-if="this.notificacaoInternaNaoLida > 0"
              color="red"
              floating
              class="badge-left"
            > {{ this.notificacaoInternaNaoLida }}</q-badge>
          </q-btn>
          <q-btn flat class="btn-rounded" :class="$q.dark.isActive ? 'text-green bg-black' : ''" icon="mdi-clipboard-list-outline" @click="tarefaEdicao = {}; modalTarefa = true" :disable="loadingMount">
            <q-tooltip content-class="text-bold"> Crear Tarea </q-tooltip>
            <q-badge v-if="(delayed + venceHoje) > 0"
              color="red"
              floating
              class="badge-left"
              @click="() => $router.push({ name: 'tarefas' })"
            > {{ delayed + venceHoje }}</q-badge>
          </q-btn>
          <q-btn style="margin-right: 5px;" flat class="btn-rounded" :class="$q.dark.isActive ? 'text-green bg-black' : ''" icon="eva-undo-outline" @click="() => $router.push({ name: 'home-dashboard' })" :disable="loadingMount">
            <q-tooltip content-class="text-bold"> Volver al menú </q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-linear-progress
          v-if="loadingMount"
          indeterminate
          color="primary"
          class="absolute-top"
          style="width: 100%;"
        />
        <StatusWhatsapp v-if="false" class="q-mx-sm full-width" />
        <q-toolbar v-show="toolbarSearch" class="menu-container column q-gutter-sm items-center full-width">
          <div class="search full-width">
          <q-input v-model="pesquisaTickets.searchParam" dense outlined rounded type="search" class="full-width" :debounce="700" @input="BuscarTicketFiltro()" >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
          <div class="row-buttons full-width">
            <q-btn flat class="bg-grey-3 btn-rounded-50" :color="cFiltroSelecionado ? 'deep-orange-9' : 'primary'" style="flex: 1;">
              Filtro
            <q-menu content-class="shadow-10 no-scroll container-rounded-10 max-height-none" style="max-height: 100vh !important">
              <div class="row q-pa-sm" style="min-width: 350px; max-width: 350px">
                <div class="q-ma-sm">
                  <div class="text-h6 q-mb-md font-family-main">Filtros Avanzados</div>
                  <q-toggle
                    v-if="profile === 'admin'"
                    class="full-width"
                    v-model="pesquisaTickets.showAll"
                    label="(Admin) - Visualizar Todos"
                    :class="{ 'q-mb-lg': pesquisaTickets.showAll }"
                    @input="debounce(BuscarTicketFiltro(), 700)"
                  />
                  <q-toggle toggle-indeterminate v-model="ordenar" label="Ordenar por fecha de creación" @input="loadOrdenar()" />
                  <q-separator class="q-mb-md" v-if="!pesquisaTickets.showAll" />
                  <div v-if="!pesquisaTickets.showAll">
                    <q-select
                      :disable="pesquisaTickets.showAll"
                      rounded
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      label="Filas"
                      color="primary"
                      v-model="pesquisaTickets.queuesIds"
                      :options="cUserQueues"
                      :input-debounce="700"
                      option-value="id"
                      option-label="queue"
                      @input="debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-list dense class="q-my-md">
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="open" color="primary" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Abiertos</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label" v-ripple v-if="profile === 'admin'">
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Pendientes</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label" v-ripple v-if="profile !== 'admin'">
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Pendientes</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="closed" color="positive" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Cerrados</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-separator class="q-mb-md" />
                    <q-toggle v-model="pesquisaTickets.withUnreadMessages" label="Solo Tickets con mensajes no leídos" @input="debounce(BuscarTicketFiltro(), 700)" />
                    <!-- <q-toggle v-model="pesquisaTickets.isNotAssignedUser" label="Solo Tickets no asignados (sin usuario definido)" @input="debounce(BuscarTicketFiltro(), 700)" /> -->
                  </div>
                  <q-separator class="q-my-md" spaced v-if="!pesquisaTickets.showAll" />
                  <q-btn class="float-right q-my-md" color="negative" label="Cerrar" push v-close-popup />
                </div>
              </div>
            </q-menu>
            <q-tooltip content-class="text-bold"> Filtro Avanzado </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-grey-3 btn-rounded-50" :class="$q.dark.isActive ? 'text-green bg-black' : ''" @click="$q.screen.lt.md ? (modalNovoTicket = true) : $router.push({ name: 'chat-contatos' })" style="flex: 1;" v-if="canAccessPageContact">
            Contactos
          <q-tooltip :content-class="`${$q.dark.isActive ? 'text-white bg-black' : ''} text-bold`">Contactos</q-tooltip>
          </q-btn>
          <q-btn flat class="bg-grey-3 btn-rounded-50" :class="$q.dark.isActive ? 'text-green bg-black' : ''" @click="showNotification()" v-if="hasMoreTickets"  style="flex: 1;">
            Atenciones
            <q-tooltip :content-class="`${$q.dark.isActive ? 'text-green bg-black' : ''} text-bold`"> Cargar Más Atenciones </q-tooltip>
          </q-btn>
          </div>

        </q-toolbar>

        <q-toolbar class="padding-person menu-left items-center ">
          <q-separator class="absolute-top" />
          <div class="full-width">

            <q-tabs
              v-model="tabTickets"
              narrow-indicator
              dense
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-3'"
              inline-label
              align="justify"
              :class="{
                'text-green': $q.dark.isActive,
                'text-black': !$q.dark.isActive
              }"

              class="btn-rounded"

            >
            <q-tab
              :ripple="false"
              name="private"
              class="btn-rounded-50"
              :class="$q.dark.isActive ? 'bg-black text-green' : 'bg-grey-3 btn-rounded-50 q-tab-personalized'"
              icon="eva-person-outline"
            >

            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ privateMessages.length }}</q-badge>
              <q-tooltip content-class="text-bold"> Conversaciones Privadas </q-tooltip>

            </q-tab>
            <q-tab
              v-if="grupoAtivo === 'disabled'"
              :ripple="false"
              name="groups"
              class="btn-rounded-50"
              :class="$q.dark.isActive ? 'bg-black text-green' : 'bg-grey-3 btn-rounded-50 q-tab-personalized'"
              icon="eva-people-outline"
            >
            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ groupMessages.length }}</q-badge>
            <q-tooltip content-class="text-bold"> Conversaciones en Grupo </q-tooltip>
            </q-tab>

          <q-btn class="btn-rounded-50" icon="mdi-book-account-outline"
              :class="$q.dark.isActive ? 'bg-black text-green' : 'bg-grey-3 btn-rounded-50 q-tab-personalized'" @click="loadMoreOpenTickets" :disable="loadingMount">
            <q-tooltip content-class="text-bold"> Cargar Más Tickets </q-tooltip>
          </q-btn>

            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center" v-if="fixarConexao === 'enabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? 'Desactivar' : 'Activar' }} Modo Oscuro (Dark Mode) </q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps">
                  <q-btn rounded flat dense size="18px" :key="item.id" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'private'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                v-if="!hidetab || (hidetab && openTickets.length > 0)"
                :ripple="false"
                name="open"
                icon="eva-message-circle-outline"
                label="Abiertos"
                :class="{
                'text-green': $q.dark.isActive,
                'tab-item': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Tickets en atención </q-tooltip>
              </q-tab>
              <q-tab
                v-if="!hidetab || (hidetab && pendingTickets.length > 0)"
                :ripple="false"
                name="pending"
                icon="eva-clock-outline"
                label="Pendientes"
                :class="{
                'text-green': $q.dark.isActive,
                'tab-item': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Tickets pendientes </q-tooltip>
              </q-tab>
              <q-tab
                v-if="!hidetab || (hidetab && closedTickets.length > 0)"
                :ripple="false"
                name="closed"
                icon="eva-lock-outline"
                label="Cerrados"
                :class="{
                'text-green': $q.dark.isActive,
                'tab-item': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Tickets cerrados </q-tooltip>
              </q-tab>
              <q-tab
                v-if="chatbotLane === 'enabled' && (!hidetab || (hidetab && pendingTicketsChatBot.length > 0))"
                :ripple="false"
                name="chatbot"
                icon="mdi-robot-outline"
                label="Chatbot"
                :class="{
                'text-green': $q.dark.isActive,
                'tab-item': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTicketsChatBot.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Chatbot </q-tooltip>
              </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'groups'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                v-if="!hidetab || (hidetab && openGroupTickets.length > 0)"
                :ripple="false"
                name="open"
                icon="eva-message-circle-outline"
                label="Abiertos"
                :class="{
                'text-green': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openGroupTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Conversaciones Abiertas </q-tooltip>
              </q-tab>
              <q-tab
                v-if="!hidetab || (hidetab && pendingGroupTickets.length > 0)"
                :ripple="false"
                name="pending"
                icon="eva-clock-outline"
                label="Pendientes"
                :class="{
                'text-green': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingGroupTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Conversaciones Pendientes </q-tooltip>
              </q-tab>
              <q-tab
                v-if="!hidetab || (hidetab && closedGroupTickets.length > 0)"
                :ripple="false"
                name="closed"
                icon="eva-lock-outline"
                label="Cerrados"
                :class="{
                'text-green': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedGroupTickets.length }}</q-badge>
                <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Conversaciones Cerradas </q-tooltip>
              </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>

        <ItemTicket
          v-show="tabTickets === 'private' && tabTicketsStatus === 'open'"
          v-for="ticket in openTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
          v-show="tabTickets === 'private' && tabTicketsStatus === 'pending'"
          v-for="ticket in pendingTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
          v-show="tabTickets === 'private' && tabTicketsStatus === 'chatbot'"
          v-for="ticket in pendingTicketsChatBot"
          :key="ticket.id+'bot'"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
          v-show="tabTickets === 'private' && tabTicketsStatus === 'closed'"
          v-for="ticket in closedTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
        v-show="tabTickets === 'groups' && tabTicketsStatus === 'open'"
          v-for="ticket in openGroupTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
        v-show="tabTickets === 'groups' && tabTicketsStatus === 'pending'"
          v-for="ticket in pendingGroupTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <ItemTicket
        v-show="tabTickets === 'groups' && tabTicketsStatus === 'closed'"
          v-for="ticket in closedGroupTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
        />

        <div class="absolute-bottom row justify-between" style="height: 50px" v-if="fixarConexao === 'disabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? 'Desactivar' : 'Activar' }} Modo Oscuro (Dark Mode) </q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps">
                  <q-btn rounded flat dense size="18px" :key="item.id" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <q-page-container>
        <router-view :mensagensRapidas="mensagensRapidas" :key="ticketFocado.id"></router-view>
      </q-page-container>

      <q-drawer v-if="!cRouteContatos && ticketFocado.id && drawerContact"
          show-if-above
          bordered
          side="right"
          class="dados-contato"
          content-class="bg-grey-3">
    <div class="flex justify-start items-end bg-white full-width no-border-radius q-pa-sm" style="height: 60px">
        <span class=" text-h6">
            <q-btn flat class="btn-small" @click="toggleDrawer" label="" icon="mdi-close" :color="$q.dark.isActive ? ('green') : 'primary'"/>
            Datos Contacto
        </span>
    </div>

        <q-scroll-area style="height: calc(100vh - 70px)">
          <div>
            <q-card class="bg-white border-radius-none q-mt-sm" style="width: 100%" flat>
              <q-card-section class="text-center">
                <q-avatar style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px">
                  <q-icon name="mdi-account" style="width: 100px; height: 100px" size="6em" color="grey-5" v-if="!ticketFocado.contact.profilePicUrl" />
                  <q-img :src="ticketFocado.contact.profilePicUrl" style="width: 100px; height: 100px">
                    <template v-slot:error>
                      <q-icon name="mdi-account" size="1.5em" :color="$q.dark.isActive ? ('green') : 'grey-5'" />
                    </template>
                  </q-img>
                </q-avatar>
                <div class="text-caption q-mt-md blur-effect"  style="font-size: 14px">
                  {{ ticketFocado.contact.name || '' }}
                </div>
                <div class="text-caption q-mt-sm blur-effect"  style="font-size: 14px" id="number">
                  <template v-if="ticketFocado.contact.number">
                    <a :class="$q.dark.isActive ? ('text-green') : ''" :href="getPhoneNumberLink(ticketFocado.contact.number)">
                      {{ ticketFocado.contact.number }}
                    </a>
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.email">
                    <a :href="'mailto:' + ticketFocado.contact.email">{{ ticketFocado.contact.email }}</a>
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.email || '' }}
                  </template>
                </div>

                <q-btn flat class="btn-rounded-50 btn-outline btn-small" icon="eva-edit-outline" label="Editar" @click="editContact(ticketFocado.contact.id)" :class="$q.dark.isActive ? ('text-green') : ''"/>
                <template v-if="cIsExtraInfo">
                  <q-list>
                    <q-item v-for="(info, idx) in ticketFocado.contact.extraInfo" :key="idx">
                      <q-item-section>
                        <q-item-label>{{ info.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </q-card-section>
            </q-card>
            <q-card class="bg-white border-radius-none q-mt-sm" style="width: 100%" flat>
              <q-card-section class="text-bold text-center q-pa-sm">
                <q-btn flat class="btn-rounded-50 btn-outline btn-small" icon="mdi-timeline-text-outline"
                :class="$q.dark.isActive ? ('text-green') : ''" @click="abrirModalLogs">
                  <q-tooltip content-class="bg-primary text-bold">
                    Logs
                  </q-tooltip>
                </q-btn>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm border-radius-none q-pa-sm" style="width: 100%" flat :key="ticketFocado.id + $uuid()">
              <q-card-section class="text-bold q-pb-none" :class="$q.dark.isActive ? ('text-green') : ''">
                Etiquetas
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none" :class="$q.dark.isActive ? ('text-green') : ''">
                <q-select
                  square
                  borderless
                  :value="ticketFocado.contact.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @input="tagSelecionada"
                  :content-class="$q.dark.isActive ? ('text-green') : ''"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label v-html="opt.tag"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :value="selected" @input="toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      <q-icon :style="`color: ${opt.color}`" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                      {{ opt.tag }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold"> Ops... Sin etiquetas creadas! </q-item-label>
                        <q-item-label caption> Registra nuevas etiquetas en la administración del sistema. </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm border-radius-none q-pa-sm" style="width: 100%" flat :key="ticketFocado.id + $uuid()">
              <q-card-section class="text-bold q-pb-none" :class="$q.dark.isActive ? ('text-green') : ''">
                Cartera
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-select
                  square
                  borderless
                  :value="ticketFocado.contact.wallets"
                  multiple
                  :max-values="1"
                  :options="usuarios"
                  use-chips
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @input="carteiraDefinida"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label v-html="opt.name"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :value="selected" @input="toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      {{ opt.name }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold"> Ops... ¡Sin carteras disponibles! </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm border-radius-none q-pa-sm" style="width: 100%; margin-bottom: 2vh" flat :key="ticketFocado.id + $uuid()" v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'">
              <q-card-section class="text-bold q-pb-none" :class="$q.dark.isActive ? ('text-green') : ''">
                Mensajes Programados
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <template v-if="ticketFocado.scheduledMessages">
                  <q-list>
                    <q-item v-for="(message, idx) in ticketFocado.scheduledMessages.filter((msg) => !msg.isDeleted)" :key="idx" clickable>
                      <q-item-section>
                        <q-item-label caption>
                          <div class="row justify-between items-center no-wrap">
                            <div>
                              <strong>Programado para:</strong>
                              <div>{{ $formatarData(message.scheduleDate, 'dd/MM/yyyy HH:mm') }}</div>
                            </div>

                            <div>
                              <div class="row q-gutter-xs no-wrap">
                                <!-- <q-btn flat round dense icon="edit" size="sm" @click="editarMensagem(message)" /> -->
                                <q-btn flat round dense icon="mdi-trash-can-outline" size="sm" @click="deletarMensagem(message)" />
                              </div>
                            </div>
                          </div>
                        </q-item-label>
                        <q-item-label caption lines="2"> <b>Msg:</b> {{ message.mediaName || message.body }} </q-item-label>
                      </q-item-section>
                      <q-tooltip :delay="500">
                        <MensagemChat :mensagens="[message]" />
                      </q-tooltip>
                    </q-item>
                  </q-list>
                </template>
              </q-card-section>
            </q-card>
          </div>
        </q-scroll-area>
      </q-drawer>

      <ModalNovoTicket :modalNovoTicket.sync="modalNovoTicket" />
      <ContatoModal
        :contactId="selectedContactId"
        :modalContato.sync="modalContato"
        @contatoModal:contato-editado="contatoEditado"
      />
      <ModalTarefa
        :modalTarefa.sync="modalTarefa"
      />

      <ModalUsuario
        :isProfile="true"
        :modalUsuario.sync="modalUsuario"
        :usuarioEdicao.sync="usuario"
      />

      <q-dialog v-model="exibirModalLogs" no-backdrop-dismiss full-height position="right" @hide="logsTicket = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              Historial del Ticket: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsTicket">
                    <q-timeline-entry
                      :key="(log && log.id) || idx"
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-green': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">{{ messagesLog[log.type] && messagesLog[log.type].message }}</div>
                        </div>
                      </template>
                    </q-timeline-entry>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

    </q-layout>
  </div>
</template>

<script>
import ItemStatusChannel from 'src/pages/sessaoWhatsapp/ItemStatusChannel.vue'
import ContatoModal from 'src/pages/contatos/ContatoModal'
import ItemTicket from './ItemTicket'
import { ConsultarLogsTicket, ConsultarTickets, DeletarMensagem } from 'src/service/tickets'
import { mapGetters } from 'vuex'
import mixinSockets from './mixinSockets'
import ModalNovoTicket from './ModalNovoTicket'
import { ListarFilas } from 'src/service/filas'
import { ConsultarResumoTarefas } from 'src/service/tarefas'
const UserQueues = JSON.parse(localStorage.getItem('queues'))
const profile = localStorage.getItem('profile')
const username = localStorage.getItem('username')
const usuario = JSON.parse(localStorage.getItem('usuario'))
import StatusWhatsapp from 'src/components/StatusWhatsapp'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { debounce } from 'quasar'
import { format } from 'date-fns'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { ListarMensagensRapidas } from 'src/service/mensagensRapidas'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { EditarEtiquetasContato, EditarCarteiraContato } from 'src/service/contatos'
import { RealizarLogout } from 'src/service/login'
import { ListarUsuarios, DadosUsuario } from 'src/service/user'
import MensagemChat from './MensagemChat.vue'
import { messagesLog } from '../../utils/constants'
import { listCountUnreadMessage } from 'src/service/chatInterno'
import ModalTarefa from 'src/pages/tarefas/ModalTarefa'
export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets],
  components: {
    ItemTicket,
    ModalNovoTicket,
    StatusWhatsapp,
    ContatoModal,
    ModalUsuario,
    MensagemChat,
    ItemStatusChannel,
    ModalTarefa
  },
  data () {
    return {
      delayed: 0,
      venceHoje: 0,
      userProfile: 'user',
      tarefaEdicao: {},
      modalTarefa: false,
      tabTickets: 'private',
      tabTicketsStatus: 'open',
      messagesLog,
      configuracoes: [],
      debounce,
      usuario,
      usuarios: [],
      selectedTab: 'open',
      username,
      modalUsuario: false,
      toolbarSearch: true,
      drawerTickets: true,
      loading: false,
      profile,
      modalNovoTicket: false,
      modalContato: false,
      selectedContactId: null,
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      countTickets: 0,
      pesquisaTickets: {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending', 'closed'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
        // date: new Date(),
      },
      ordernar: null,
      filter: false,
      filas: [],
      filasUser: [],
      etiquetas: [],
      mensagensRapidas: [],
      modalEtiquestas: false,
      exibirModalLogs: false,
      logsTicket: [],
      notificacaoInternaNaoLida: '',
      drawerContact: false,
      contadorUniversal: '',
      ContactAdmin: null,
      chatbotLane: null,
      spyticket: null,
      hidetab: null,
      pageNumber: 1,
      hasMore: true
    }
  },
  computed: {
    currentAlertSound() {
      return this.isSilentMode ? this.silenceSound : this.alertSound
    },
    canAccessPageContact() {
      return this.ContactAdmin !== 'enabled' || this.userProfile === 'admin'
    },
    ...mapGetters([
      'tickets',
      'ticketFocado',
      'hasMore',
      'whatsapps'
    ]),
    cUserQueues () {
      return UserQueues
    },
    style () {
      return {
        height: this.$q.screen.height + 'px'
      }
    },
    cToolbarSearchHeigthAjust () {
      return this.toolbarSearch ? 58 : 0
    },
    cHeigVerticalTabs () {
      return `${50 + this.cToolbarSearchHeigthAjust}px`
    },
    cRouteContatos () {
      return this.$route.name === 'chat-contatos'
    },
    cFiltroSelecionado () {
      const { queuesIds, showAll, withUnreadMessages, isNotAssignedUser } = this.pesquisaTickets
      return !!(queuesIds?.length || showAll || withUnreadMessages || isNotAssignedUser)
    },
    cIsExtraInfo () {
      return this.ticketFocado?.contact?.extraInfo?.length > 0
    },
    openTickets() {
      let filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && !ticket.isGroup)
      filteredTickets = this.ordenar ? this.sortTicketsAscending(filteredTickets) : this.sortTicketsDescending(filteredTickets)
      return Object.values(this.groupTickets(filteredTickets))
    },
    pendingTickets() {
      let filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
      filteredTickets = this.ordenar ? this.sortTicketsAscending(filteredTickets) : this.sortTicketsDescending(filteredTickets)
      return Object.values(this.groupTickets(filteredTickets))
    },
    pendingTicketsChatBot() {
      let filteredTickets = this.tickets.filter(ticket =>
        ticket.status === 'pending' &&
      !ticket.isGroup &&
      ((ticket.stepAutoReplyId && ticket.autoReplyId) || (ticket.chatFlowId && ticket.stepChatFlow))
      )
      filteredTickets = this.ordenar ? this.sortTicketsAscending(filteredTickets) : this.sortTicketsDescending(filteredTickets)
      return Object.values(this.groupTickets(filteredTickets))
    },
    closedTickets() {
      let tickets = this.tickets.filter(ticket => ticket.status === 'closed' && !ticket.isGroup)
      tickets = this.ordenar ? this.sortTicketsAscending(tickets) : this.sortTicketsDescending(tickets)
      return tickets
    },
    closedGroupTickets() {
      let tickets = this.tickets.filter(ticket => ticket.status === 'closed' && ticket.isGroup)
      tickets = this.ordenar ? this.sortTicketsAscending(tickets) : this.sortTicketsDescending(tickets)
      return tickets
    },
    openGroupTickets() {
      let filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && ticket.isGroup)
      filteredTickets = this.ordenar ? this.sortTicketsAscending(filteredTickets) : this.sortTicketsDescending(filteredTickets)
      return Object.values(this.groupTickets(filteredTickets))
    },
    pendingGroupTickets() {
      let filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && ticket.isGroup)
      filteredTickets = this.ordenar ? this.sortTicketsAscending(filteredTickets) : this.sortTicketsDescending(filteredTickets)
      return Object.values(this.groupTickets(filteredTickets))
    },
    privateMessages() {
      let tickets = this.tickets.filter(ticket => ticket.unreadMessages && !ticket.isGroup)
      tickets = this.ordenar ? this.sortTicketsAscending(tickets) : this.sortTicketsDescending(tickets)
      return tickets
    },
    groupMessages() {
      let tickets = this.tickets.filter(ticket => ticket.unreadMessages && ticket.isGroup)
      tickets = this.ordenar ? this.sortTicketsAscending(tickets) : this.sortTicketsDescending(tickets)
      return tickets
    }
  },
  methods: {
    toggleSilentMode() {
      this.isSilentMode = !this.isSilentMode
      localStorage.setItem('silentMode', this.isSilentMode)
      window.location.reload()
    },
    sortTicketsAscending(tickets) {
      return tickets.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    },
    sortTicketsDescending(tickets) {
      return tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },
    groupTickets(tickets) {
      return tickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket
        }
        return acc
      }, {})
    },
    async getTaskSummary() {
      const owner = localStorage.getItem('username')
      try {
        const response = await ConsultarResumoTarefas({ owner })
        this.delayed = response.data.delayed
        this.venceHoje = response.data.venceHoje
      } catch (error) {
        console.error('Error al consultar el resumen de tareas:', error)
      }
    },
    async loadOrdenar() {
      try {
        this.$store.commit('RESET_TICKETS')
        this.loading = true
        switch (this.ordenar) {
          case false:
            this.ordenar = null
            break
          case true:
            this.ordenar = false
            break
          case null:
            this.ordenar = true
            break
        }
        this.consultarTicketsOrdenados()
      } catch (error) {
        console.log(error)
      }
    },
    async actualizarUsuario() {
      try {
        const { data } = await DadosUsuario(this.usuario.userId)
        this.filasUser = data.queues
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuario', error)
      }
    },
    async loadMoreOpenTickets() {
      this.$q.notify({
        type: 'warning',
        message: 'Atenciones cargados en las pestañas abierto, pendiente y cerrado!',
        position: 'top'
      })
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    showNotification() {
      this.$q.notify({
        type: 'warning',
        message: 'Atenciones cargados en las pestañas abierto, pendiente y cerrado!',
        position: 'top'
      })
      this.loadMoreOpenTickets()
    },
    toggleDrawer() {
      this.drawerContact = false
    },
    getPhoneNumberLink(number) {
      if ((number.startsWith('55')) && (number.charAt(4) > 5)) {
        return `tel:${number.slice(0, 4)}9${number.slice(-8)}`
      } else {
        return `tel:${number}`
      }
    },
    async listarMensagens() {
      try {
        const { data } = await listCountUnreadMessage(this.usuario.userId)
        this.notificacaoInternaNaoLida = data.count
      } catch (e) {

      }
    },

    handlerNotifications (data) {
      const options = {
        body: `${data.body} - ${format(new Date(), 'HH:mm')}`,
        icon: data.ticket.contact.profilePicUrl,
        tag: data.ticket.id,
        renotify: true
      }

      const notification = new Notification(
        `Mensaje de ${data.ticket.contact.name}`,
        options
      )

      setTimeout(() => {
        notification.close()
      }, 10000)

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', data.ticket)
        this.$router.push({ name: 'atendimento' })
      }
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const ignoreGroupMsg = data.find(config => config.key === 'ignoreGroupMsg')
      this.grupoAtivo = ignoreGroupMsg.value
      const universalCounter = data.find(config => config.key === 'universalCounter')
      this.contadorUniversal = universalCounter.value
      const ContactAdmin = data.find(config => config.key === 'ContactAdmin')
      this.ContactAdmin = ContactAdmin.value
      const chatbotLane = data.find(config => config.key === 'chatbotLane')
      this.chatbotLane = chatbotLane.value
      const spyticket = data.find(config => config.key === 'spyticket')
      this.spyticket = spyticket.value
      const hidetabConfig = data.find(config => config.key === 'hidetab')
      this.hidetab = hidetabConfig ? hidetabConfig.value === 'enabled' : false
    },
    onScroll (info) {
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    contatoEditado (contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        ...paramsInit
      }
      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count
        this.$store.commit('LOAD_TICKETS', data.tickets)
        this.$store.commit('SET_HAS_MORE', data.hasMore)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
    },
    async consultarTicketsOrdenados (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        ...paramsInit
      }
      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count

        const tickets = data.tickets

        if (this.ordenar == true) {
          tickets.sort((a, b) => {
            const data1 = new Date(a.updatedAt)
            const data2 = new Date(b.updatedAt)
            if (data1.getTime() > data2.getTime()) {
              return 1
            }
            if (data1.getTime() < data2.getTime()) {
              return -1
            }
            return 0
          })
          this.$store.commit('LOAD_TICKETS', tickets)
        }
        if (this.ordenar == false) {
          tickets.sort((a, b) => {
            const data1 = new Date(a.updatedAt)
            const data2 = new Date(b.updatedAt)
            if (data1.getTime() > data2.getTime()) {
              return 1
            }
            if (data1.getTime() < data2.getTime()) {
              return -1
            }
            return 0
          })
          this.$store.commit('LOAD_TICKETS', tickets)
        }
        if (this.ordenar == null) {
          this.$store.commit('LOAD_TICKETS', tickets)
        }

        this.$store.commit('SET_HAS_MORE', data.hasMore)

        console.log(tickets)
      } catch (err) {
        this.$notificarErro('Algún problema', err)
        console.error(err)
      }
    },
    async BuscarTicketFiltro () {
      this.$store.commit('RESET_TICKETS')
      this.loading = true
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
      this.pesquisaTickets = {
        ...this.pesquisaTickets,
        pageNumber: 1
      }
      await this.consultarTickets(this.pesquisaTickets)
      this.loading = false
      this.$setConfigsUsuario({ isDark: this.$q.dark.isActive })
    },
    async onLoadMore () {
      if (this.tickets.length === 0 || !this.hasMore || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
      localStorage.setItem('filasCadastradas', JSON.stringify(data || []))
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    async abrirModalUsuario () {
      this.modalUsuario = true
    },
    async efetuarLogout () {
      try {
        await RealizarLogout(usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')

        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro(
          'No fue posible realizar el logout',
          error
        )
      }
    },
    copyContent (content) {
      navigator.clipboard.writeText(content)
        .then(() => {
        })
        .catch((error) => {
          console.error('Error al copiar el contenido: ', error)
        })
    },
    deletarMensagem (mensagem) {
      const data = { ...mensagem }
      this.$q.dialog({
        title: '¡Atención! ¿Desea realmente eliminar el mensaje? ',
        message: 'Los mensajes antiguos no se eliminarán en el cliente.',
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
        DeletarMensagem(data)
          .then(res => {
            this.loading = false
            mensagem.isDeleted = true
          })
          .catch(error => {
            this.loading = false
            console.error(error)
            this.$notificarErro('No fue posible eliminar el mensaje', error)
          })
      }).onCancel(() => {
      })
    },
    async tagSelecionada (tags) {
      const { data } = await EditarEtiquetasContato(this.ticketFocado.contact.id, [...tags])
      this.contatoEditado(data)
    },
    async carteiraDefinida (wallets) {
      const { data } = await EditarCarteiraContato(this.ticketFocado.contact.id, [...wallets])
      this.contatoEditado(data)
    },
    async listarUsuarios () {
      try {
        const { data } = await await ListarUsuarios({ pageNumber: this.pageNumber })
        this.usuarios = [...this.usuarios, ...data.users]
        this.hasMore = data.hasMore

        if (this.hasMore) {
          this.pageNumber += 1
          this.listarUsuarios()
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    setValueMenu () {
      this.drawerTickets = !this.drawerTickets
    },
    setValueMenuContact () {
      this.drawerContact = !this.drawerContact
    },
    async abrirModalLogs () {
      const { data } = await ConsultarLogsTicket({ ticketId: this.ticketFocado.id })
      this.logsTicket = data
      this.exibirModalLogs = true
    }
  },
  beforeMount () {
    this.$store.commit('RESET_TICKETS')
    this.listarFilas()
    this.listarEtiquetas()
    this.listarConfiguracoes()
    const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
    if (!filtros?.pageNumber) {
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    }
  },
  async mounted () {
    this.getTaskSummary()
    this.loadingMount = true

    this.notify = this.$q.notify({
      position: 'top',
      type: 'positive',
      message: 'Espere mientras se cargan los tickets...',
      progress: true,
      actions: [{ icon: 'close', round: true, color: 'white' }]
    })

    if (!localStorage.getItem('reloaded')) {
      localStorage.setItem('reloaded', 'true')
      window.location.reload()
    } else {
      localStorage.removeItem('reloaded')
    }

    try {
      this.$root.$on('infor-cabecalo-chat:acao-menu', this.setValueMenu)
      this.$root.$on('update-ticket:info-contato', this.setValueMenuContact)
      await this.actualizarUsuario()
      await this.listarMensagens()
      this.$store.commit('UPDATE_SHOW_MENU', this.showMenu)
      this.socketTicketList()
      this.pesquisaTickets = JSON.parse(localStorage.getItem('filtrosAtendimento'))
      this.$root.$on('handlerNotifications', this.handlerNotifications)
      await this.listarWhatsapps()
      await this.consultarTickets()
      await this.listarUsuarios()
      try {
        await this.actualizarUsuario()
        await this.listarMensagens()
        await this.loadMoreOpenTickets()
      } catch (e) {
        console.log(e)
      }
      const { data } = await ListarMensagensRapidas()
      this.mensagensRapidas = data

      const savedSilentMode = localStorage.getItem('silentMode')
      if (savedSilentMode !== null) {
        this.isSilentMode = JSON.parse(savedSilentMode)
      }

      if ('Notification' in window) {
        Notification.requestPermission()
      }
      this.userProfile = localStorage.getItem('profile')

      if (this.$route?.params?.ticketId) {
        const ticketId = this.$route.params.ticketId
        if (ticketId && this.tickets.length > 0) {
          const ticket = this.tickets.find((t) => t.id === +ticketId)
          if (ticket) {
            if (this.$q.screen.lt.md && ticket.status !== 'pending') {
              this.$root.$emit('infor-cabecalo-chat:acao-menu')
            }
            this.$store.commit('SET_HAS_MORE', true)
            this.$store.dispatch('AbrirChatMensagens', ticket)
          }
        }
      } else {
        this.$router.push({ name: 'chat-empty' })
      }
    } catch (error) {
      console.error('Error al montar el componente:', error)
    } finally {
      this.isMounted = true
      this.loadingMount = false
      if (this.notify) {
        this.notify()
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    if (!this.isMounted) {
      next(false)
    } else {
      next()
    }
  },
  destroyed() {
    this.$store.commit('RESET_TICKETS')
    this.$root.$off('handlerNotifications', this.handlerNotifications)
    this.$root.$off('infor-cabecalo-chat:acao-menu', this.setValueMenu)
    this.$root.$on('update-ticket:info-contato', this.setValueMenuContact)
    this.$store.commit('TICKET_FOCADO', {})
  }
}
</script>

<style lang="sass">
absolute-top
  position: absolute
  top: 0
.upload-btn-wrapper
  position: relative
  overflow: hidden
  display: inline-block

  & input[type="file"]
    font-size: 100px
    position: absolute
    left: 0
    top: 0
    opacity: 0

.WAL
  width: 100%
  height: 100%

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0!important
  font-size: 1.4rem

.tab-container
  overflow-x: auto
  font-size: 0.75rem

.tab-scroll
  white-space: nowrap

.badge-left
  border-radius: 50%

.black-icon
  color: black !important

.q-tabs__indicator
  background: transparent !important

.blur-effect
  filter: blur(0px)
</style>
