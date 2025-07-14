<template>
  <div class="q-pa-sm"
  :class="{'bg-grey-9' : $q.dark.isActive}">
 <vencimento />
    <q-card class="dashboard-header ">
      <q-card-section class="row justify-between items-center">
        <div class="dashboard-title col-xs-12 col-md-3 text-h4 text-bold text-md-left"
        :class="{'text-green' : $q.dark.isActive}">
          Panel de control
        </div>
        <div class="dashboard-header-inputs col-xs-12 col-md-9 justify-end flex q-gutter-sm text-center text-md-right q-my-md rdsPainelDate">
          <div class="q-mb-sm">
            <q-datetime-picker
              style="width: 200px"
              dense
              hide-bottom-space
              outlined
              stack-label
              bottom-slots
              label="Fecha/Hora de programación"
              mode="date"
              color="primary"
              format24h
              v-model="params.startDate"
            />
          </div>
          <div class="q-mb-sm">
            <q-datetime-picker
              style="width: 200px"
              dense
              hide-bottom-space
              outlined
              stack-label
              bottom-slots
              label="Fecha/Hora de programación"
              mode="date"
              color="primary"
              format24h
              v-model="params.endDate"
            />
          </div>
          <q-btn
            class="generate-button q-mb-sm"
            :class="{'generate-button-dark' : $q.dark.isActive}"
            flat
            icon="refresh"
            label="Refrescar"
            @click="getDashData"
          />
          <q-toggle
            v-if="grupoAtivo === 'disabled'"
            v-model="toggleValue"
            checked-icon="check"
            unchecked-icon="clear"
            @input="handleGroups"
            :color="toggleValue ? 'green' : 'negative'"
            size="md"
            >
            <q-tooltip anchor="bottom middle" self="top middle">
              <span>Filtrar Grupos</span>
            </q-tooltip>
          </q-toggle>
        </div>

      </q-card-section>
    </q-card>
    <q-card class="q-my-md" style="box-shadow: none !important; background-color: transparent" v-if="toggleValue === false">
      <q-card class="dashboard-container-cards">
      <q-card-section class="dashboard-cards q-pa-md q-mb-sm">
        <div class="row justify-center ">
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Total de Atenciones</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ ticketsAndTimes.qtd_total_atendimentos }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-account-multiple" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              :class="{'bg-dark text-green' : $q.dark.isActive}"
            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Activo</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ ticketsAndTimes.qtd_demanda_ativa }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-account-check" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              :class="{'bg-dark text-green' : $q.dark.isActive}"
            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Receptivo</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number text-h4 text-bold text-center my-card-content">
                      {{ ticketsAndTimes.qtd_demanda_receptiva }}

                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-phone-incoming" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              :class="{'bg-dark text-green' : $q.dark.isActive}"
            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Nuevos contactos</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number text-h4 text-bold text-center my-card-content">
                      {{ ticketsAndTimes.new_contacts }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-account-plus" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card flat bordered class="my-card full-height"
            :class="{'bg-dark text-green' : $q.dark.isActive}">
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Tiempo Medio de Atención</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number text-h5 text-bold text-center my-card-content">
                      {{ cTmaFormat }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-clock-outline" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">

            <q-card flat bordered class="my-card full-height"
            :class="{'bg-dark text-green' : $q.dark.isActive}">
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">T.M. 1ra. Respuesta</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number text-h5 text-bold text-center">
                  {{ cTmeFormat }}
                  </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-timer-sand" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
    </q-card>
    <div class="row">
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <ApexChart
              ref="ChartTicketsChannels"
              type="pie"
              height="300"
              width="100%"
              :options="ticketsChannelsOptions"
              :series="ticketsChannelsOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <ApexChart
              ref="ChartTicketsQueue"
              type="pie"
              height="300"
              width="100%"
              :options="ticketsQueueOptions"
              :series="ticketsQueueOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-card class="q-my-md">
      <q-card-section>
        <ApexChart
          ref="ChartTicketsEvolutionChannels"
          type="bar"
          height="300"
          width="100%"
          :options="ticketsEvolutionChannelsOptions"
          :series="ticketsEvolutionChannelsOptions.series"
        />
      </q-card-section>
    </q-card>
    <q-card class="q-my-md">
      <q-card-section class="q-pa-md">
        <ApexChart
          ref="ChartTicketsEvolutionByPeriod"
          type="line"
          height="300"
          :options="ticketsEvolutionByPeriodOptions"
          :series="ticketsEvolutionByPeriodOptions.series"
        />
      </q-card-section>
    </q-card>
  <q-card class="q-my-md q-pa-sm" v-if="toggleValue === false">
    <q-card-section class="q-pa-md">
      <q-table
        title="Rendimiento del equipo"
        :data="ticketsPerUsersDetail"
        :columns="TicketsPerUsersDetailColumn"
        row-key="email"
        :pagination.sync="paginationTableUser"
        :rows-per-page-options="[0]"
        bordered
        flat
        hide-bottom
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row col text-bold"> {{ props.row.name || 'No informado' }} </div>
            <div class="row col text-caption">{{ props.row.email }} </div>
          </q-td>
        </template>
<template v-slot:body-cell-avaliacao="props">
  <q-td :props="props">
    <star-rating
      :rating="props.row.avaliacao"
      :star-size="20"
      :max-rating="3"
      :increment="0.01"
      :show-rating="false"
      active-color="yellow"
      inactive-color="grey"
      :round-start-rating="false"
    />
  </q-td>
</template>
      </q-table>
    </q-card-section>
  </q-card>
  </div>
</template>

<script>
import { groupBy } from 'lodash'
import { ListarFilas } from 'src/service/filas'
import { ListarUsuarios } from 'src/service/user'
import {
  GetDashTicketsAndTimes,
  GetDashTicketsChannels,
  GetDashTicketsEvolutionChannels,
  GetDashTicketsQueue,
  GetDashTicketsEvolutionByPeriod,
  GetDashTicketsPerUsersDetail
} from 'src/service/estatisticas'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { subDays, format, formatDuration, differenceInDays } from 'date-fns'
import ApexChart from 'vue-apexcharts'
import { QIcon } from 'quasar'
import StarRating from 'vue-star-rating'
import vencimento from '../../components/vencimentodash.vue'

export default {
  name: 'IndexDashboard',
  components: { ApexChart, QIcon, vencimento, StarRating },
  data () {
    return {
      confiWidth: {
        horizontal: false,
        width: this.$q.screen.width
      },
      toggleValue: false,
      grupoAtivo: 'disabled',
      params: {
        startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        queuesIds: [],
        userIds: [],
        isGroup: false
      },
      paginationTableUser: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      filas: [],
      usuarios: [],
      ticketsChannels: [],
      ticketsChannelsOptions: {
        // colors: ['#00E396', '#ff2a00','#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        chart: {
          toolbar: {
            show: true
          }
        },
        legend: {
          position: 'bottom'
        },
        title: {
          text: 'Atención por canal'
        },
        noData: {
          text: '¡Sin datos aquí!',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: undefined
          }
        },
        series: [],
        labels: [],
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -10
            }
          }
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'middle',
          style: {
            fontSize: '16px',
            offsetY: '150',
            fontFamily: 'Helvetica, Arial, sans-serif'
          },
          offsetX: 0
        }
      },
      ticketsQueue: [],
      ticketsQueueOptions: {
        colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        chart: {
          toolbar: {
            show: true
          }
        },
        legend: {
          position: 'bottom'
        },
        title: {
          text: 'Atención por fila'
        },
        noData: {
          text: '¡Sin datos aquí!',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: undefined
          }
        },
        series: [],
        labels: [],
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -10
            }
          }
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'middle',
          style: {
            fontSize: '16px',
            offsetY: '150',
            fontFamily: 'Helvetica, Arial, sans-serif'
          },
          offsetX: 0
        }
      },
      ticketsEvolutionChannels: [],
      ticketsEvolutionChannelsOptions: {
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        chart: {
          type: 'bar',
          stacked: true,
          stackType: '100%',
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false | '<img src="/static/icons/reset.png" width="20">'
            }

          }
        },
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        grid: {
          show: true,
          strokeDashArray: 0
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        dataLabels: {
          enabled: true
        },
        title: {
          text: 'Evolución por canal',
          align: 'left'
        },
        stroke: {
          width: 0
        },
        xaxis: {
          type: 'category',
          categories: [],
          tickPlacement: 'on'
        },
        yaxis: {
          title: {
            text: 'Atenciones',
            style: {
              color: '#FFF'
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return Number(val).toFixed(0)
            }
          }
        }
      },
      ticketsEvolutionByPeriod: [],
      ticketsEvolutionByPeriodOptions: {
        // colors: ['#008FFB', '#00E396', '#FEB019'],
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
        theme: {
          mode: 'light',
          palette: 'palette1'
        },
        chart: {
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false | '<img src="/static/icons/reset.png" width="20">'
            }

          }
        },
        grid: {
          show: true,
          strokeDashArray: 0,
          xaxis: {
            lines: {
              show: true
            }
          }
        },
        stroke: {
          width: [4, 4, 4]
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.05,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
        title: {
          text: 'Evolución de atenciones',
          align: 'left'
        },
        dataLabels: {
          enabled: true,
          enabledOnSeries: [1]
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Atenciones'
          }
        },
        tooltip: {
          shared: false,
          x: {
            show: false
          },
          y: {
            formatter: function (val) {
              return Number(val).toFixed(0)
            }
          }
        },
        legend: {
          show: false
        }
      },
      ticketsAndTimes: {
        qtd_total_atendimentos: null,
        qtd_demanda_ativa: null,
        qtd_demanda_receptiva: null,
        tma: null,
        tme: null
      },
      ticketsPerUsersDetail: [],
      TicketsPerUsersDetailColumn: [
        {
          name: 'name',
          label: 'Usuario',
          field: 'name',
          align: 'left',
          style: 'width: 300px;',
          format: (v, r) => {
            return v ? `${r.name} | ${r.email}` : 'No informado'
          }
        },
        {
          name: 'qtd_pendentes',
          label: 'Pendiente',
          field: 'qtd_pendentes'
        },
        {
          name: 'qtd_em_atendimento',
          label: 'Asistiendo',
          field: 'qtd_em_atendimento'
        },
        {
          name: 'qtd_resolvidos',
          label: 'Finalizados',
          field: 'qtd_resolvidos'
        },
        {
          name: 'qtd_por_usuario',
          label: 'Total',
          field: 'qtd_por_usuario'
        },
        {
          name: 'tme',
          label: 'T.M.E',
          field: 'tme',
          align: 'center',
          headerStyle: 'text-align: center !important',
          format: v => {
            return formatDuration(v) || ''
          }
        },
        {
          name: 'tma',
          label: 'T.M.A',
          field: 'tma',
          align: 'center',
          headerStyle: 'text-align: center !important',
          format: v => {
            return formatDuration(v) || ''
          }
        },
        {
          name: 'avaliacao',
          label: 'Evaluación',
          field: 'avaliacao',
          align: 'center',
          headerStyle: 'text-align: center !important'
        }
      ]
    }
  },
  watch: {
    '$q.dark.isActive' () {
      // necessário para carregar os gráficos com a alterçaão do mode (dark/light)
      this.$router.go()
    },
    '$q.screen.width' () {
      // necessário para carregar os gráficos com a alterçaão do mode (dark/light)
      this.setConfigWidth()
    }
  },
  computed: {
    cTmaFormat () {
      const tma = this.ticketsAndTimes.tma || {}
      return formatDuration(tma) || ''
    },
    cTmeFormat () {
      const tme = this.ticketsAndTimes.tme || {}
      return formatDuration(tme) || ''
    }
  },
  methods: {
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    async listarUsuarios () {
      const { data } = await ListarUsuarios()
      this.usuarios = data
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const ignoreGroupMsg = data.find(config => config.key === 'ignoreGroupMsg')
      this.grupoAtivo = ignoreGroupMsg.value
    },
    handleGroups() {
      if (this.toggleValue) {
        this.params.isGroup = true
        this.$q.notify({
          type: 'positive',
          message: '¡Filtrar estadísticas para grupos!',
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }]
        })
      } else {
        this.params.isGroup = false
        this.$q.notify({
          type: 'positive',
          message: '¡Filtrar estadísticas para conversaciones privadas!',
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }]
        })
      }
    },
    setConfigWidth () {
      const diffDays = differenceInDays(new Date(this.params.endDate), new Date(this.params.startDate))
      if (diffDays > 30) {
        this.configWidth = { horizontal: true, width: 2200 }
      } else {
        const actualWidth = this.$q.screen.width
        this.configWidth = { horizontal: true, width: actualWidth - (actualWidth < 768 ? 40 : 100) }
      }
    },
    getDashTicketsAndTimes () {
      GetDashTicketsAndTimes(this.params).then(res => {
        this.ticketsAndTimes = res.data[0]
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsQueue () {
      GetDashTicketsQueue(this.params).then(res => {
        this.ticketsQueue = res.data
        const series = []
        const labels = []
        this.ticketsQueue.forEach(e => {
          series.push(+e.qtd)
          labels.push(e.label)
        })
        this.ticketsQueueOptions.series = series
        this.ticketsQueueOptions.labels = labels
        this.$refs.ChartTicketsQueue.updateOptions(this.ticketsQueueOptions)
        this.$refs.ChartTicketsQueue.updateSeries(series, true)
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsChannels () {
      const statusMapping = {
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        instagram: 'Instagram'
      }
      GetDashTicketsChannels(this.params).then(res => {
        this.ticketsChannels = res.data
        const series = []
        const labels = []
        this.ticketsChannels.forEach(e => {
          series.push(+e.qtd)
          labels.push(statusMapping[e.label])
        })
        this.ticketsChannelsOptions.series = series
        this.ticketsChannelsOptions.labels = labels
        this.$refs.ChartTicketsChannels.updateOptions(this.ticketsChannelsOptions)
        this.$refs.ChartTicketsChannels.updateSeries(series, true)
      })
        .catch(err => {
          console.error(err)
        })
    },
    getDashTicketsEvolutionChannels () {
      GetDashTicketsEvolutionChannels(this.params)
        .then(res => {
          this.ticketsEvolutionChannels = res.data
          const dataLabel = groupBy({ ...this.ticketsEvolutionChannels }, 'dt_referencia')
          const labels = Object.keys(dataLabel)
          // .map(l => {
          //   return format(new Date(l), 'dd/MM')
          // })
          this.ticketsEvolutionChannelsOptions.labels = labels
          this.ticketsEvolutionChannelsOptions.xaxis.categories = labels
          const series = []
          const dados = groupBy({ ...this.ticketsEvolutionChannels }, 'label')
          for (const item in dados) {
            series.push({
              name: item,
              // type: 'line',
              data: dados[item].map(d => {
                // if (labels.includes(format(new Date(d.dt_ref), 'dd/MM'))) {
                return d.qtd
              })
            })
          }
          this.ticketsEvolutionChannelsOptions.series = series
          this.$refs.ChartTicketsEvolutionChannels.updateOptions(this.ticketsEvolutionChannelsOptions)
          this.$refs.ChartTicketsEvolutionChannels.updateSeries(series, true)
        })
        .catch(error => {
          console.error(error)
        })
    },
    getDashTicketsEvolutionByPeriod () {
      GetDashTicketsEvolutionByPeriod(this.params)
        .then(res => {
          this.ticketsEvolutionByPeriod = res.data
          const series = [{
            name: 'Atenciones',
            type: 'column',
            data: []
          }, {
            type: 'line',
            data: []
          }
          ]
          const labels = []
          this.ticketsEvolutionByPeriod.forEach(e => {
            series[0].data.push(+e.qtd)
            labels.push(e.label)
          })
          series[1].data = series[0].data
          this.ticketsEvolutionByPeriodOptions.labels = labels
          this.ticketsEvolutionByPeriodOptions.series = series
          this.$refs.ChartTicketsEvolutionByPeriod.updateOptions(this.ticketsEvolutionByPeriodOptions)
          this.$refs.ChartTicketsEvolutionByPeriod.updateSeries(series, true)
        })
        .catch(error => {
          console.error(error)
        })
    },
    async getDashTicketsPerUsersDetail() {
      try {
        const { data } = await GetDashTicketsPerUsersDetail(this.params)
        this.ticketsPerUsersDetail = data.map(user => ({
          ...user,
          avaliacao: user.average_rating || 0 // Ajuste para refletir o nome correto
        }))
      } catch (err) {
        console.error(err)
      }
    },
    getDashData () {
      this.setConfigWidth()
      this.getDashTicketsAndTimes()
      this.getDashTicketsChannels()
      this.getDashTicketsEvolutionChannels()
      this.getDashTicketsQueue()
      this.getDashTicketsEvolutionByPeriod()
      this.getDashTicketsPerUsersDetail()
    }

  },
  beforeMount () {
    this.$store.commit('UPDATE_SHOW_MENU', this.showMenu)
    this.listarConfiguracoes()
    const mode = this.$q.dark.isActive ? 'dark' : 'light'
    const theme = {
      mode,
      palette: 'palette1',
      monochrome: {
        enabled: true,
        color: '#ff7103',
        shadeTo: mode,
        shadeIntensity: 0.95
      }

    }
    this.ticketsQueueOptions = { ...this.ticketsQueueOptions, theme }
    this.ticketsChannelsOptions = { ...this.ticketsChannelsOptions, theme }
    this.ticketsEvolutionChannelsOptions = { ...this.ticketsEvolutionChannelsOptions, theme }
    this.ticketsEvolutionByPeriodOptions = { ...this.ticketsEvolutionByPeriodOptions, theme }
  },
  mounted () {
    this.listarUsuarios()
    this.listarFilas()
    this.getDashData()
  }
}
</script>

<style lang="scss" >
.rating-stars {
  display: flex;
  align-items: center;
}
.rating-stars .q-icon {
  color: yellow;
}
.text-branco{
  color: white;
}
.apexcharts-theme-dark svg {
  background: none !important;
}
.bg-vermelho {
  background-color: #f44336;
}
.bg-amarelo{
  background-color: #fec107;
}
.rdsPainelDate{
  display: flex;
  justify-content: space-around !important;
}
</style>
