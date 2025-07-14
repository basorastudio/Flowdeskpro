<template>
  <div >
    <q-table
      class="container-rounded-10 contact-table my-sticky-dynamic q-ma-lg"
      :data="filterEmpresas"
      :columns="columns"
      :loading="loading"
      row-key="id"
    >
      <template v-slot:top-left>
        <div>

          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-office-building q-pr-sm" />
            Empresas
          </h2>

          <div class="row flex-gap-1">
            <q-input
          style="width: 300px"
          filled
          dense
          class="contact-search col-grow"
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Buscar"
          @input="filtrarEmpresa"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn

          class="generate-button btn-rounded-50 q-ml-md"
          :class="{
            'text-green': $q.dark.isActive,
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          icon="eva-plus-outline "
          label="Agregar"
          @click="tenantSelecionado = {}; modalEmpresa = true; isEdit = false"
        />
          </div>

        </div>

      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="cnpj" :props="props">
            {{ props.row.cnpj }}
          </q-td>
          <q-td key="status" :props="props">
          <q-icon size="24px" :name="props.row.status == 'active' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
              :color="props.row.status == 'active' ? 'positive' : 'negative'" />
          </q-td>
          <q-td key="maxUsers" :props="props">
            {{ props.row.maxUsers }}
          </q-td>
          <q-td key="maxConnections" :props="props">
            {{ props.row.maxConnections }}
          </q-td>
          <q-td key="phone" :props="props">
            {{ props.row.phone }}
          </q-td>
          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="dueDate" :props="props">
            {{ formatDate(props.row.dueDate) }}
          </q-td>
          <q-td key="planId" :props="props">
            {{ props.row.planId }}
          </q-td>
          <q-td class="text-center">
            <q-btn flat round icon="mdi-cash-multiple" @click="listarInvoices(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Listar Facturas pendientes
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon="mdi-calendar-plus" @click="addMonthTenant(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Agregar 1 mes
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon="mdi-account-reactivate" @click="abrirModalConformacaoAtivacao(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                {{ props.row.status == 'active' ? 'Desactivar Empresa' : 'Activar Empresa' }}
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon="mdi-account-group" @click="listarUsuarios(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Ver Usuarios
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon='mdi-qrcode' @click="abrirWhatsapp(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Listar Conexiones
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon="eva-edit-outline" @click="editarEmpresa(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Editar Empresa
              </q-tooltip>
            </q-btn>
            <q-btn flat round icon="eva-trash-outline" @click="deletarTenant(props.row)">
              <q-tooltip content-class="shadow-4" :offset="[10, 10]">
                Eliminar Empresa
              </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <ModalEmpresa :modalEmpresa.sync="modalEmpresa" :tenantSelecionado.sync="tenantSelecionado" :isEdit.sync="isEdit"
      key="modal-empresa" />
    <ModalUsuario :modalUsuario.sync="modalUsuario" :tenant.sync="tenantSelecionado" key="modal-usuario" />
    <ModalInvoices :modalInvoices.sync="modalInvoices" :tenant.sync="tenantSelecionado" key="modal-invoices" />
    <ModalWhatsapp :modalWhatsapp.sync="modalWhatsapp" :listaWhatsapp.sync="filterWhatsapp" key="modal-whatsapp" />
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm" style="margin-top: 2.5rem;margin-bottom: 1rem;margin-right: 2.5rem; margin-left: 1rem;">
            <b>¿Realmente desea {{ empresaSelecionada.status == 'active' ? 'DESACTIVAR' : 'ACTIVAR' }}
              la empresa {{ empresaSelecionada.name }}?</b>
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="cancelar" @click="cancelarAtivacao()" />
          <q-btn flat label="confirmar" color="primary" @click="confirmarAtivacao()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { AdminListarEmpresas, AdminUpdateStatusEmpresa, DeletarTenant, AddMonthTenant } from '../../service/empresas'
import { adminListarWhatsapps } from 'src/service/sessoesWhatsapp'
import ModalEmpresa from './ModalEmpresa.vue'
import ModalUsuario from './ModalUsuario.vue'
import ModalInvoices from './ModalInvoices.vue'
import ModalWhatsapp from './ModalWhatsapp.vue'
import { mapGetters } from 'vuex'
import { format, parseISO } from 'date-fns'

export default {
  name: 'Empresa',
  components: {
    ModalEmpresa,
    ModalUsuario,
    ModalWhatsapp,
    ModalInvoices
  },
  data() {
    return {
      loading: false,
      filterEmpresas: [],
      confirm: false,
      isEdit: false,
      empresaSelecionada: {},
      whatsappStatus: {},
      listaWhatsapp: [],
      filterWhatsapp: [],
      filter: '',
      modalEmpresa: false,
      modalUsuario: false,
      modalInvoices: false,
      modalWhatsapp: false,
      tenantSelecionado: {}
    }
  },
  computed: {
    ...mapGetters([
      'empresas'
    ]),
    columns() {
      return [
        {
          name: 'name',
          label: 'Razón Social',
          field: 'name',
          align: 'left',
          sortable: false
        },
        {
          name: 'cnpj',
          label: 'CNPJ',
          field: 'cnpj',
          align: 'left',
          sortable: false
        },
        {
          name: 'status',
          label: 'Estado',
          field: 'status',
          align: 'left',
          sortable: false
        },
        {
          name: 'maxUsers',
          label: 'Máx. Usuarios',
          field: 'maxUsers',
          align: 'left',
          sortable: false
        },
        {
          name: 'maxConnections',
          label: 'Máx. Conexiones',
          field: 'maxConnections',
          align: 'left',
          sortable: false
        },
        {
          name: 'phone',
          label: 'WhatsApp',
          field: 'phone',
          align: 'left',
          sortable: false
        },
        {
          name: 'email',
          label: 'Correo Electrónico',
          field: 'email',
          align: 'left',
          sortable: false
        },
        {
          name: 'dueDate',
          label: 'Vencimiento',
          field: 'dueDate',
          align: 'left',
          sortable: false,
          format: (v) => format(parseISO(v), 'dd/MM/yyyy')
        },
        {
          name: 'planId',
          label: 'Plan',
          field: 'planId',
          align: 'left',
          sortable: false
        },
        {
          name: 'acoes',
          label: 'Acciones',
          field: 'acoes',
          align: 'center'
        }
      ]
    }
  },
  watch: {
    empresas: {
      handler() {
        if (this.filter.length > 0) {
          this.filterEmpresas = this.empresas.filter(u => u.name.toLowerCase().indexOf(this.filter) == 0)
        } else {
          this.filterEmpresas = this.empresas
        }
      }
    }
  },
  methods: {
    async addMonthTenant(tenant) {
      this.loading = true
      try {
        const response = await AddMonthTenant(tenant)
        const updatedTenant = response.data

        // Actualiza el estado de la empresa en Vuex
        this.$store.commit('EMPRESAS_ADMIN', {
          action: 'update',
          id: tenant.id,
          data: updatedTenant
        })
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `¡Se agregó 1 mes a la empresa ${tenant.name}!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error('Error al agregar mes a la empresa:', error)
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: 'Error al agregar mes. Por favor, inténtelo nuevamente.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } finally {
        this.loading = false
      }
    },
    deletarTenant(tenant) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `¿Desea realmente eliminar la Empresa "${tenant.id}"?`,
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
        this.loading = true
        try {
          await DeletarTenant(tenant)
          // Actualiza el estado de las empresas en Vuex
          this.$store.commit('EMPRESAS_ADMIN', { action: 'delete', id: tenant.id })
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: `¡Empresa ${tenant.id} eliminada!`,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } catch (error) {
          console.error('Error al eliminar la empresa:', error)
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: 'Error al eliminar la empresa. Por favor, inténtelo nuevamente.',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } finally {
          this.loading = false
        }
      })
    },
    formatDate(date) {
      try {
        return format(parseISO(date), 'dd/MM/yyyy')
      } catch (error) {
        console.error('Formato de fecha inválido:', error)
        return date // Fallback al formato original si falla el análisis
      }
    },
    async listarEmpresas() {
      this.loading = true
      const { data } = await AdminListarEmpresas()
      this.$store.commit('EMPRESAS_ADMIN', { action: 'create', data: data })
      this.loading = false
    },
    async ListarWhatsapps() {
      this.loading = true
      try {
        const { data } = await adminListarWhatsapps()
        this.listaWhatsapp = data
        if (data.length > 0) {
          console.log('Estado WhatsApp:', data)
          this.statusWhatsapp = data[0].status
        }
      } catch (error) {
        console.error('Error al listar los WhatsApps:', error)
      } finally {
        this.loading = false
      }
    },
    async abrirWhatsapp(empresa) {
      console.log('aquí', empresa)
      this.filterWhatsapp = this.listaWhatsapp.filter(item => item.tenant.id == empresa.id)
      console.log('2', this.filterWhatsapp)
      this.modalWhatsapp = true
    },
    abrirModalConformacaoAtivacao(empresa) {
      this.empresaSelecionada = empresa
      this.confirm = true
    },
    cancelarAtivacao() {
      this.empresaSelecionada = {}
      this.confirm = false
    },
    async confirmarAtivacao() {
      const status = this.empresaSelecionada.status == 'active' ? 'disable' : 'active'
      const tenant = await AdminUpdateStatusEmpresa(this.empresaSelecionada.id, { status })
      this.$store.commit('EMPRESAS_ADMIN', { action: 'update-status', data: tenant.data })
      this.$q.notify({
        type: 'positive',
        message: 'Estado cambiado con éxito.',
        position: 'top',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.$forceUpdate()
      this.confirm = false
    },
    editarEmpresa(tenant) {
      this.tenantSelecionado = tenant
      this.isEdit = true
      this.modalEmpresa = true
    },
    async listarUsuarios(tenant) {
      this.tenantSelecionado = tenant
      this.modalUsuario = true
    },
    async listarInvoices(tenant) {
      this.tenantSelecionado = tenant
      this.modalInvoices = true
    },
    filtrarEmpresa() {
      if (this.filter.length > 0) {
        this.filterEmpresas = this.empresas.filter(u => u.name.toLowerCase().indexOf(this.filter) == 0)
      } else {
        this.filterEmpresas = this.empresas
      }
    }
  },
  created() {
    this.listarEmpresas()
    this.ListarWhatsapps()
  }
}
</script>

<style lang="sass" >
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* el color de fondo es importante para th; solo especifica uno */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* este será el indicador de carga */
  thead tr:last-child th
    /* altura de todas las filas de encabezado anteriores */
    top: 63px
  thead tr:first-child th
    top: 0
</style>
