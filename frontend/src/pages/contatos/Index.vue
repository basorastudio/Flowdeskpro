<template>
  <div>
    <div v-if="!canAccessPage">
      <q-banner dense inline-actions class="bg-red text-white">
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        Solo los administradores pueden acceder a esta página.
        <template v-slot:action>
          <q-btn flat dense @click="redirectHome">OK</q-btn>
        </template>
      </q-banner>
    </div>
  <div>
    <div v-if="canAccessPage">
    <q-table
      class="contact-table my-sticky-dynamic container-rounded-10"
      title="Contactos"
      :id="`tabela-contatos-${isChatContact ? 'atendimento' : ''}`"
      :data="contacts"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      :bordered="isChatContact"
      :square="isChatContact"
      :flat="isChatContact"
      :separator="isChatContact ? 'vertical' : 'horizontal'"
      :class="{
        'q-ma-lg': !isChatContact,
        'q-ml-md heightChat': isChatContact
      }"
    >
      <template v-slot:top>
        <div class="row full-width q-table__title items-center ">
          <q-btn
            v-if="isChatContact"
            class="q-mr-sm"
            color="black"
            round
            flat
            icon="mdi-close"
            @click="$router.push({ name: 'chat-empty' })"
          />
          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="eva-people-outline q-pr-sm" />
            Contactos
          </h2>
          <div class="contact-header full-width">
        <q-input
        class="contact-search"
          :class="{
          'order-last q-mt-md': $q.screen.width < 500
        }"
          style="width: 300px"
          filled
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Localizar"
          @input="filtrarContato"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="generate-button btn-rounded-50 q-ml-md"
          icon="eva-sync-outline"
          label="Sincronizar Contactos"
          @click="confirmarSincronizarContatos('whatsapp')"
        />
        <q-btn
          class="generate-button btn-rounded-50 q-ml-md"
          icon="eva-cloud-upload-outline"
          label="Importar"
          v-if="!isChatContact"
          @click="modalImportarContatos = true"
          >
          <q-tooltip :offset="[5, 5]">
            Nombre;Usuario<br>
            Número;5551900000
          </q-tooltip>
        </q-btn>
        <q-btn
          class="generate-button btn-rounded-50 q-ml-md"
          v-if="!isChatContact"
          icon="eva-cloud-download-outline"
          label="Exportar"
          @click="handleExportContacts"
        />
        <q-btn
          class="generate-button btn-rounded-50 q-ml-md"
          icon="eva-person-add-outline"
          label="Añadir"
          @click="selectedContactId = null; modalContato = true"
        />
        </div>
        </div>

        </template>
      <template  v-slot:body-cell-profilePicUrl="props">
        <q-td >
          <q-avatar style="border: 1px solid #9e9e9ea1 !important">
            <q-icon
              name="mdi-account"
              size="1.5em"
              color="grey-5"
              v-if="!props.value"
            />
            <q-img
              :src="props.value"
              style="max-width: 150px"
            >
              <template v-slot:error>
                <q-icon
                  name="mdi-account"
                  size="1.5em"
                  color="grey-5"
                />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="img:whatsapp-logo.png"
            @click="handleSaveTicket(props.row, 'whatsapp')"
            v-if="props.row.number"
          />
          <q-btn
            flat
            round
            icon="eva-edit-outline"
            @click="editContact(props.row.id)"
            :class="$q.dark.isActive ? ('text-green') : ''"
          />
          <q-btn
            flat
            round
            icon="eva-trash-outline"
            @click="deleteContact(props.row.id)"
            :class="$q.dark.isActive ? ('text-green') : ''"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-number="props" >
        <q-td>
          <span v-if="props.row.number" class="blur-effect">
            <a :class="$q.dark.isActive ? ('text-white') : ''" :href="getPhoneNumberLink(props.row.number)">
              {{ props.row.number }}

            </a>
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-email="props">
        <q-td>
          <span  v-if="props.row.email">
            <a :class="$q.dark.isActive ? ('text-white') : ''" :href="'mailto:' + props.row.email">{{ props.row.email }}</a>
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td>
          <span  :class="$q.dark.isActive ? ('text-white') : ''" v-if="props.row.name">
            {{ props.row.name }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-tags="props">
      <q-td :props="props">
        <span :class="$q.dark.isActive ? ('bg-black text-white') : ''" v-html="formatTags(props.row.tags)"></span>
      </q-td>
    </template>
      <template v-slot:body-cell-disableBot="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline'"
            :color="props.value ? 'negative' : 'positive'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-disableCampaign="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline'"
            :color="props.value ? 'negative' : 'positive'"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contacts.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ContatoModal
      :contactId="selectedContactId"
      :modalContato.sync="modalContato"
      @contatoModal:contato-editado="UPDATE_CONTACTS"
      @contatoModal:contato-criado="UPDATE_CONTACTS"
    />

    <q-dialog
      v-model="modalImportarContatos"
      persistent
      @show="abrirEnvioArquivo"
    >
      <q-card class="modal-container container-rounded-10">

        <q-card-actions align="right">
          <q-btn
            flat
            dense
            color="negative"
            icon="eva-close"
            v-close-popup
            @click="isImportCSV = false; modalImportarContatos = false"
          />
        </q-card-actions>

        <q-card-section class="items-center">
          <div class="text-h6 text-center font-family-main">Importar Contactos</div>
        </q-card-section>
        <div class="q-ma-lg container-border container-rounded-10">
          <q-card-section>
          <q-file
            rounded
            ref="PickerFileMessage"
            id="PickerFileMessage"
            bg-color="blue-grey-1"
            outlined
            dense
            use-chips
            accept=".csv"
            v-model="file"
            label="Importar contactos"
            hint="El archivo debe contener las columnas Nombre y Número"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>

        </q-card-section>
        </div>

        <div class="q-ma-lg container-border container-rounded-10">
          <q-card-section>
          <q-card
            class="bg-white q-mt-sm btn-rounded"
            style="width: 100%"
            bordered
            flat
          >
            <q-card-section class="text-bold font-family-main q-pb-none">
              Etiquetas
              <q-separator />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-select
                square
                borderless
                v-model="tags"
                multiple
                :options="etiquetas"
                use-chips
                option-value="id"
                option-label="tag"
                emit-value
                map-options
                dropdown-icon="add"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label v-html="opt.tag"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :value="selected"
                        @input="toggleOption(opt)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <q-chip
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-ma-xs row col-12 text-body1"
                  >
                    <q-icon
                      :style="`color: ${opt.color}`"
                      name="mdi-pound-box-outline"
                      size="28px"
                      class="q-mr-sm"
                    />
                    {{ opt.tag }}
                  </q-chip>
                </template>
                <template v-slot:no-option="{ itemProps, itemEvents }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label class="text-negative text-bold">
                        Ops... ¡Sin etiquetas creadas!
                      </q-item-label>
                      <q-item-label caption>
                        Registra nuevas etiquetas en la administración del sistema.
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

              </q-select>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section>
          <q-card
            class="bg-white q-mt-sm btn-rounded"
            style="width: 100%"
            bordered
            flat
          >
            <q-card-section class="text-bold font-family-main q-pb-none">
              Cartera
              <q-separator />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-select
                square
                borderless
                v-model="wallets"
                multiple
                :max-values="1"
                :options="usuarios"
                use-chips
                option-value="id"
                option-label="name"
                emit-value
                map-options
                dropdown-icon="add"
              >
              </q-select>
            </q-card-section>
          </q-card>
        </q-card-section>
        </div>

        <q-card-section>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            class="q-ml-md btn-rounded-50"
            color="negative"
            label="Cancelar"
            v-close-popup
            @click="isImportCSV = false; modalImportarContatos = false"
          />

          <q-btn
            class="q-ml-md btn-rounded-50"
            color="positive"
            icon="eva-checkmark"
            label="Confirmar"
            @click="handleImportCSV"
          />
          <q-btn
            class="q-ml-md generate-button btn-rounded-50"
            icon="eva-download"
            label="Descargar Modelo"
            @click="downloadModelCsv"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">Seleccione el destino:</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionada"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            label="Fila de destino" />
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="usuarioSelecionado"
            :options="usuariosTransferencia.filter(filterUsers)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            label="Usuario destino" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat
            label="Salir"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn flat
            label="Guardar"
            color="primary"
            @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarTicket, AtualizarTicket } from 'src/service/tickets'
import { ListarContatos, ImportarArquivoContato, DeletarContato, SyncronizarContatos, ExportarArquivoContato } from 'src/service/contatos'
import ContatoModal from './ContatoModal'
import { ListarUsuarios } from 'src/service/user'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { mapGetters } from 'vuex'
import { ListarFilas } from 'src/service/filas'
import { ListarConfiguracoes } from 'src/service/configuracoes'

export default {
  name: 'IndexContatos',
  components: { ContatoModal },
  userProfile: 'user',
  usuario: {},
  props: {
    isChatContact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canAccessPage() {
      return this.ContactAdmin !== 'enabled' || this.userProfile === 'admin'
    },
    ...mapGetters(['whatsapps'])
  },
  data () {
    return {
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      filas: [],
      usuariosTransferencia: [],
      contacts: [],
      userProfile: 'user',
      ContactAdmin: null,
      ticketFocado: '',
      modalImportarContatos: false,
      modalContato: false,
      file: [],
      isImportCSV: false,
      filter: null,
      selectedContactId: null,
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      wallets: [],
      tags: [],
      etiquetas: [],
      usuarios: [],
      pagination: {
        rowsPerPage: 100,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        {
          name: 'name',
          label: 'Nombre',
          field: 'name',
          align: 'left',
          style: 'width: 300px',
          format: (v, r) => {
            if (r.number && r.name == r.number && r.pushname) {
              return r.pushname
            }
            return r.name
          }
        },
        {
          name: 'number',
          label: 'WhatsApp',
          field: 'number',
          align: 'center',
          style: 'width: 300px'
        },
        {
          name: 'wallet',
          label: 'Cartera',
          field: 'wallet',
          align: 'center',
          style: 'width: 300px'
          // format: v => v ? v.map(n => n.name)?.join(', ') : ''
        },
        {
          name: 'tags',
          label: 'Etiquetas',
          field: 'tags',
          align: 'center',
          style: 'width: 300px'
        },
        { name: 'email', label: 'Email', field: 'email', style: 'width: 500px', align: 'left' },
        { name: 'disableBot', label: 'BOT', field: 'disableBot', align: 'center' },
        { name: 'disableCampaign', label: 'Campaña', field: 'disableCampaign', align: 'center' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    redirectHome() {
      this.$router.push('/')
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const ContactAdmin = data.find(config => config.key === 'ContactAdmin')
      this.ContactAdmin = ContactAdmin.value
    },
    formatTags(tags) {
      if (!Array.isArray(tags)) return ''

      return tags.map(tag => {
        return `<span style="background-color: ${tag.color}; padding: 2px 8px; border-radius: 4px; color: white; margin-right: 4px;">${tag.tag}</span>`
      }).join('')
    },
    downloadModelCsv() {
      const csvContent = 'nombre;número\nUsuario;5551900000'
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', 'modelo.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    getPhoneNumberLink(number) {
      if ((number.startsWith('55')) && (number.charAt(4) > 5)) {
        return `tel:${number.slice(0, 4)}9${number.slice(-8)}`
      } else {
        return `tel:${number}`
      }
    },
    abrirEnvioArchivo (event) {
      this.isImportCSV = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleImportCSV () {
      try {
        this.$q.notify({
          type: 'warning',
          message: 'Esto puede tardar un poco.',
          caption: 'Al finalizar, la página se actualizará.',
          position: 'top'
        })
        const formData = new FormData()
        formData.append('file', this.file)
        if (this.tags.length > 0) {
          formData.append('tags', this.tags)
        }
        if (this.wallets.length > 0) {
          formData.append('wallets', this.wallets)
        }
        await ImportarArquivoContato(formData)
        this.$notificarSucesso('Contactos importados con éxito!')
        this.$router.go(0)
      } catch (err) {
        this.$notificarErro(err)
      }
    },
    async listarFilas() {
      return new Promise((resolve, reject) => {
        ListarFilas()
          .then(({ data }) => {
            this.filas = data.filter(fila => fila.isActive)
            this.modalTransferirTicket = true
            return this.listarUsuariosTransferencia()
          })
          .then(() => {
            this.$once('modalClosed', () => {
              resolve()
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('Problema al cargar filas', error)
            reject(error)
          })
      })
    },
    async listarUsuariosTransferencia () {
      try {
        const { data } = await ListarUsuarios()
        this.usuariosTransferencia = data.users
        this.modalTransferirTicket = true
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async confirmarTransferenciaTicket () {
      // if (!this.filaSelecionada) return
      // if(!this.usuarioSelecionado){
      //   this.$q.notify({
      //     type: 'negative',
      //     message: 'Seleccione un usuario.',
      //     progress: true,
      //     actions: [{
      //       icon: 'close',
      //       round: true,
      //       color: 'white'
      //     }]
      //   })
      //   return
      // }
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado || userId,
        queueId: this.filaSelecionada || null,
        status: 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: 'Ticket transferido.',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$emit('modalClosed')
      this.$store.commit('TICKET_FOCADO', {})
    },
    downloadFile (downloadLink) {
      const link = document.createElement('a')
      link.href = downloadLink
      link.setAttribute('download', 'contactos.xlsx')
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleExportContacts () {
      ExportarArquivoContato()
        .then(res => {
          const downloadLink = res.data.downloadLink
          this.downloadFile(downloadLink)
        })
        .catch(error => {
          console.error('Error al exportar contactos:', error)
        })
    },
    LOAD_CONTACTS (contacts) {
      const newContacts = []
      contacts.forEach(contact => {
        const contactIndex = this.contacts.findIndex(c => c.id === contact.id)
        if (contactIndex !== -1) {
          this.contacts[contactIndex] = contact
        } else {
          newContacts.push(contact)
        }
      })
      const contactsObj = [...this.contacts, ...newContacts]
      this.contacts = contactsObj
    },
    UPDATE_CONTACTS (contact) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        newContacts[contactIndex] = contact
      } else {
        newContacts.unshift(contact)
      }
      this.contacts = [...newContacts]
    },
    DELETE_CONTACT (contactId) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contactId)
      if (contactIndex !== -1) {
        newContacts.splice(contactIndex, 1)
      }
      this.contacts = [...newContacts]
    },
    filtrarContato (data) {
      this.contacts = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.loading = true
      this.listarContatos()
    },
    async listarContatos () {
      this.loading = true
      const { data } = await ListarContatos(this.params)
      // console.log(data.contacts)
      // const user = this.usuario
      // console.log(data)
      // data.contacts = data.contacts.filter(function (element) {
      //   return (user.profile == 'admin' || element.tickets[0].userId == user.userId)
      // })
      this.params.hasMore = data.hasMore
      this.LOAD_CONTACTS(data.contacts)
      this.loading = false
      this.pagination.lastIndex = this.contacts.length - 1
      this.pagination.rowsNumber = data.count
    },
    onScroll ({ to, ref, ...all }) {
      if (this.loading !== true && this.params.hasMore === true && to === this.pagination.lastIndex) {
        this.loading = true
        this.params.pageNumber++
        this.listarContatos()
      }
    },
    async handleSaveTicket (contact, channel) {
      if (!contact.id) return
      const itens = []
      const channelId = null
      this.whatsapps.forEach(w => {
        if (w.type === channel) {
          itens.push({ label: w.name, value: w.id })
        }
      })
      this.$q.dialog({
        title: `Contacto: ${contact.name}`,
        message: 'Seleccione el canal para iniciar la atención.',
        options: {
          type: 'radio',
          model: channelId,
          // inline: true
          isValid: v => !!v,
          items: itens
        },
        ok: {
          push: true,
          color: 'positive',
          label: 'Iniciar'
        },
        cancel: {
          push: true,
          label: 'Cancelar',
          color: 'negative'
        },
        persistent: true
      }).onOk(async channelId => {
        if (!channelId) return
        this.loading = true
        try {
          const { data: ticket } = await CriarTicket({
            contactId: contact.id,
            isActiveDemand: true,
            userId: userId,
            channel,
            channelId,
            status: 'open'
          })
          this.ticketFocado = ticket
          await this.listarFilas()
          await this.$store.commit('SET_HAS_MORE', true)
          await this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$q.notify({
            message: `Atención Iniciada || ${ticket.contact.name} - Ticket: ${ticket.id}`,
            type: 'positive',
            position: 'top',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
        } catch (error) {
          if (error.status === 409) {
            console.log(error)
            const ticketAtual = JSON.parse(error.data.error)
            if (ticketAtual.whatsappId === null) {
              await AtualizarTicket(ticketAtual.id, {
                whatsapp: channelId
              })
              this.abrirAtendimentoExistente(contact, ticketAtual)
              return
            } else {
              this.abrirAtendimentoExistente(contact, ticketAtual)
              return
            }
          }
          this.$notificarErro('¡Ocurrió un error!', error)
        }
        this.loading = false
      })
    },
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    deleteContact (contactId) {
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea eliminar el contacto?',
        // message: 'Los mensajes antiguos no se eliminarán en WhatsApp.',
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
        DeletarContato(contactId)
          .then(res => {
            this.DELETE_CONTACT(contactId)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: '¡Contacto eliminado!',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('No se puede eliminar el contacto', error)
          })
        this.loading = false
      })
    },
    abrirChatContato (ticket) {
      // en caso de estar en tamaño móvil, cerrar el drawer de los contactos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente (contato, ticket) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `${contato.name} tiene una atención en curso (Atención: ${ticket.id}). ¿Desea abrir la atención?`,
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
      }).onOk(async () => {
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            'No se pudo actualizar el token',
            error
          )
        }
      })
    },
    confirmarSincronizarContatos(channel) {
      const itens = []
      const channelId = null
      console.log(this.whatsapps)
      this.whatsapps.forEach(w => {
        if (w.type === channel) {
          itens.push({ label: w.name, value: w.id })
        }
      })
      this.$q.dialog({
        title: '¡Atención! ¿Realmente desea sincronizar los contactos?',
        message: 'Todos los contactos con los que ya ha conversado por WhatsApp serán creados. Esto puede tardar un poco...',
        options: {
          type: 'radio',
          model: channelId, // Use el channelId como modelo
          isValid: v => !!v,
          items: itens
        },
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sí',
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async (channelId) => {
        this.loading = true
        await this.sincronizarContatos(channelId)
        this.loading = false
      })
    },
    async sincronizarContatos (channelId) {
      try {
        this.loading = true
        await SyncronizarContatos(channelId)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: 'Los contactos están siendo actualizados. Esto puede tardar un tiempo...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocurrió un error al sincronizar los contactos', error)
        this.loading = true
      }
      this.loading = true
    }
  },
  mounted () {
    this.listarConfiguracoes()
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    this.listarContatos()
    this.listarUsuarios()
    this.listarEtiquetas()
  }
}
</script>

<style lang="sass" >
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px

.blur-effect
  filter: blur(0px)
</style>
