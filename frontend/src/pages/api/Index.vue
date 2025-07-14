<template>
  <div v-if="userProfile === 'admin'">
    <q-card class="container-border container-rounded-10 q-ma-lg">
      <q-card-section>
        <div>
          <h2 :class="$q.dark.isActive ? ('text-green') : ''">
            <q-icon name="mdi-call-split"></q-icon>
            Configuraciones API
          </h2>

          <q-btn
            class="generate-button btn-rounded-50"
            icon="eva-plus-outline"
            label="Agregar"
            style="margin: 2px;"
            @click="apiEdicao = {}; modalApi = !modalApi;" />
        </div>
      </q-card-section>
      <q-card-section class="scroll"
        style="height: calc(100vh - 200px)">
        <q-item v-for="api in apis"
          :key="api.token"
          class="q-my-md container-rounded-10 container-border">

          <q-item-section top>
            <q-item-label class="text-bold text-h6 q-my-sm">
              Nombre: {{ api.name }}
              <div class="text-grey-8 q-gutter-xs float-right">
                <q-btn class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-content-copy"
                  @click="copy(api.token)">
                  <q-tooltip>
                    Copiar token
                  </q-tooltip>
                </q-btn>
                <q-btn class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="eva-edit-outline"
                  @click="editarAPI(api)">
                  <q-tooltip>
                    Editar Configuración
                  </q-tooltip>
                </q-btn>
                <q-btn class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-autorenew"
                  @click="gerarNovoToken(api)">
                  <q-tooltip>
                    Generar nuevo Token
                  </q-tooltip>
                </q-btn>

                <q-btn class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="eva-trash-outline"
                  @click="deletarApi(api)">
                  <q-tooltip>
                    Eliminar Configuración
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-label>
            <q-separator/>
            <q-item-label lines="4"
              style="word-break: break-all; padding-top: 10px">
              <p class="text-weight-medium text-nowrap q-pr-md blur-effect">
                <span class="text-bold">Url:
                </span>
                {{ montarUrlIntegração(api.id) }}
              </p>
            </q-item-label>
            <q-item-label style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md blur-effect">
                <span class="text-bold">Token:
                </span>
                {{ api.token }}
              </p>
            </q-item-label>
            <q-item-label lines="1"
              class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase">
            </q-item-label>
            <q-item-label style="word-break: break-all;">
          <q-btn
            class="generate-button btn-rounded-50"
            label="POSTMAN"
            style="margin: 2px;"
            @click="download" />
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Descarga el archivo de postman verifique uso en el sitio
                </span>
                <a href="https://www.postman.com/" target="_blank">https://www.postman.com/</a>
              </p>
            </q-item-label>
            <q-item-label
              lines="1"
              class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
            >
            </q-item-label>
          </q-item-section>
        </q-item>

      </q-card-section>
    </q-card>

    <ModalApi :modalApi.sync="modalApi"
      :apiEdicao.sync="apiEdicao"
      @modal-api:criada="apiCriada"
      @modal-api:editada="apiEditada" />

  </div>
</template>

<script>
import { ListarAPIs, ApagarAPI, NovoTokenAPI } from 'src/service/api'
import { copyToClipboard } from 'quasar'
import ModalApi from './ModalApi'
export default {
  name: 'APIs',
  components: {
    ModalApi
  },
  data () {
    return {
      userProfile: 'user',
      apiEdicao: {},
      modalApi: false,
      apis: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
        { name: 'token', label: 'Token', classes: 'ellipsis', style: 'max-width: 400px', field: 'token', align: 'left' },
        { name: 'isActive', label: 'Activo', field: 'isActive', align: 'center' },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `${process.env.VUE_URL_API}/v1/api/external`
    }
  },
  methods: {
    download () {
      const link = document.createElement('a')
      link.href = 'apiizing.json'
      link.download = 'apiizing.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    montarUrlIntegração (id) {
      return `${this.cBaseUrlIntegração}/${id}`
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso('¡Token copiado!'))
        .catch()
    },
    async listarAPIs () {
      const { data } = await ListarAPIs()
      this.apis = data.apis
    },
    apiCriada (api) {
      const newApis = [...this.apis]
      newApis.push(api)
      this.apis = [...newApis]
    },
    apiEditada (api) {
      const newApis = [...this.apis]
      const idx = newApis.findIndex(f => f.id === api.id)
      if (idx > -1) {
        newApis[idx] = api
      }
      this.apis = [...newApis]
    },
    editarAPI (api) {
      this.apiEdicao = { ...api }
      this.modalApi = true
    },
    gerarNovoToken (api) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `¿Realmente desea generar un nuevo token para "${api.name}"?
        Recuerde que las integraciones que utilicen el actual dejarán de funcionar
        hasta que actualice el token donde sea necesario.`,
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
          const { data } = await NovoTokenAPI(api)
          this.apiEditada(data)
          this.$notificarSucesso('¡Token actualizado!')
        } catch (error) {
          this.$notificarErro(
            'No fue posible actualizar el token',
            error
          )
        }
      })
    },
    deletarApi (api) {
      this.$q.dialog({
        title: '¡Atención!',
        message: `¿Realmente desea eliminar "${api.name}"?`,
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
        ApagarAPI(api)
          .then(res => {
            let newApis = [...this.apis]
            newApis = newApis.filter(a => a.id !== api.id)
            this.apis = [...newApis]
            this.$notificarSucesso(`${api.name} eliminada!`)
          })
          .catch(error => this.$notificarErro(`No fue posible eliminar ${api.name}`, error))
        this.loading = false
      })
    }

  },
  mounted () {
    this.userProfile = localStorage.getItem('profile')
    this.listarAPIs()
  }
}
</script>

<style lang="scss" scoped>
  .item-label {
    border-bottom: 1px solid #ccc; // Color del borde
    padding-bottom: 10px; // Espaciado debajo del contenido
    margin-bottom: 10px; // Espaciado debajo del borde

    &:last-child {
      border-bottom: none; // Elimina el borde del último elemento
    }
  }
  .blur-effect {
    filter: blur(0px)
  }
</style>
