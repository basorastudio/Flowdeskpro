<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      class="contact-table my-sticky-dynamic container-rounded-10"
      :data="usuarios"
      title="Usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
    >
      <template v-slot:top-left>
        <div>

          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-account-group-outline q-pr-sm" />
            Usuarios
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
          placeholder="Localize"
          @input="filtrarUsuario"
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
          label="Adicionar"
          @click="usuarioSelecionado = {}; modalUsuario = true"
        />
          </div>

        </div>

      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-arrow-decision-outline"
            :class="$q.dark.isActive ? ('text-green') : ''"
            @click="gerirFilasUsuario(props.row)"
          >
            <q-tooltip>
              Gestión de las filas de usuarios
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="eva-edit-outline"
            :class="$q.dark.isActive ? ('text-green') : ''"
            @click="editarUsuario(props.row)"
          />
          <q-btn
            flat
            round
            icon="eva-trash-outline"
            :class="$q.dark.isActive ? ('text-green') : ''"
            @click="deletarUsuario(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ usuarios.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ModalUsuario
      :modalUsuario.sync="modalUsuario"
      @modalUsuario:usuario-editado="UPDATE_USUARIO"
      @modalUsuario:usuario-criado="usuarioCriado"
      :usuarioEdicao.sync="usuarioSelecionado"
    />
    <ModalFilaUsuario
      :modalFilaUsuario.sync="modalFilaUsuario"
      :usuarioSelecionado.sync="usuarioSelecionado"
      :filas="filas"
      @modalFilaUsuario:sucesso="UPDATE_USUARIO"
    />
  </div>
</template>

<script>
import { ListarUsuarios, DeleteUsuario } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import ModalUsuario from './ModalUsuario'
import ModalFilaUsuario from './ModalFilaUsuario'
export default {
  name: 'IndexUsuarios',
  components: { ModalUsuario, ModalFilaUsuario },
  data () {
    return {
      userProfile: 'user',
      usuarios: [],
      usuarioSelecionado: {},
      modalFilaUsuario: false,
      filas: [],
      optionsProfile: [
        { value: 'user', label: 'Usuário' },
        { value: 'admin', label: 'Administrador' }
      ],
      modalUsuario: false,
      filter: null,
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
        { name: 'email', label: 'Correo electrónico', field: 'email', align: 'left' },
        {
          name: 'queues',
          label: 'Filas',
          field: 'queues',
          align: 'left',
          format: (v) => !v ? '' : v.map(f => f.queue).join(', '),
          classes: 'ellipsis',
          style: 'max-width: 400px;'
        },
        { name: 'profile', label: 'Perfil', field: 'profile', align: 'left', format: (v) => this.optionsProfile.find(o => o.value == v).label },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    LOAD_USUARIOS(users) {
      const newUsers = []
      users.forEach(user => {
        const userIndex = this.usuarios.findIndex(c => c.id === user.id)
        if (userIndex !== -1) {
          this.usuarios[userIndex] = user
        } else {
          newUsers.push(user)
        }
      })
      this.usuarios = [...this.usuarios, ...newUsers]
    },
    UPDATE_USUARIO (usuario) {
      let newUsuarios = [...this.usuarios]
      const usuarioIndex = newUsuarios.findIndex(c => c.id === usuario.id)
      if (usuarioIndex !== -1) {
        newUsuarios[usuarioIndex] = usuario
      } else {
        newUsuarios = [usuario, ...newUsuarios]
      }
      this.usuarios = [...newUsuarios]
    },
    DELETE_USUARIO (userId) {
      const newObj = [...this.usuarios.filter(u => u.id !== userId)]
      this.usuarios = [...newObj]
    },
    async listarUsuarios () {
      this.loading = true
      try {
        const response = await ListarUsuarios(this.params)

        if (response.data && Array.isArray(response.data.users)) {
          this.usuarios = [
            ...this.usuarios,
            ...response.data.users
          ]
          this.pagination.rowsNumber = response.data.count || 0
          this.pagination.hasMore = response.data.hasMore
        } else {
          console.error('La respuesta de la API no está en el formato esperado:', response.data)
        }
      } catch (error) {
        console.error('Error al enumerar a los usuarios:', error)
      } finally {
        this.loading = false
      }
    },
    filtrarUsuario (data) {
      this.usuarios = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.listarUsuarios()
    },
    onScroll({ to, ref, ...all }) {
      if (!this.loading && this.params.hasMore && to >= (this.usuarios.length - 10)) {
        this.loading = true
        this.params.pageNumber++
        this.listarUsuarios()
      }
    },
    usuarioCriado (usuario) {
      const obj = [...this.usuarios]
      obj.push(usuario)
      this.usuarios = [...obj]
    },
    editarUsuario (usuario) {
      this.usuarioSelecionado = usuario
      this.modalUsuario = true
    },
    deletarUsuario (usuario) {
      this.$q.dialog({
        title: `¡¡Atención!! Realmente quieres eliminar al usuario "${usuario.name}"?`,
        cancel: {
          label: 'No',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Si',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeleteUsuario(usuario.id)
          .then(res => {
            this.DELETE_USUARIO(usuario.id)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Usuario ${usuario.name} eliminado!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('No es posible eliminar al usuario', error)
          })
        this.loading = false
      })
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    gerirFilasUsuario (usuario) {
      this.usuarioSelecionado = usuario
      this.modalFilaUsuario = true
    }
  },
  async mounted () {
    await this.listarFilas()
    await this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
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
