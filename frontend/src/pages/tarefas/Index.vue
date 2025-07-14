<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="contact-table container-rounded-10 my-sticky-dynamic q-ma-lg"
      title="Tareas"
      :data="tarefas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <div>
          <h2 :class="$q.dark.isActive ? ('text-white') : ''">
            <q-icon name="eva-list-outline" />
            Tareas
          </h2>
          <div class="row flex-gap-col-1">
          <q-input
        :class="{
        'order-last q-mt-md': $q.screen.width < 500
      }"
        class="contact-search"
        style="width: 300px"
        filled
        dense
        debounce="500"
        v-model="filter"
        clearable
        placeholder="Localize"
        @input="filtrarTarefa"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
          :class="$q.dark.isActive ? ('text-white') : ''"
          icon="eva-plus-outline"
          label="Adicionar"
          class="generate-button btn-rounded-50"
          @click="tarefaEdicao = {}; modalTarefa = true"
        />
      </div>
        </div>

      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
              flat
              :class="$q.dark.isActive ? ('text-white') : ''"
              round
              icon="mdi-check-circle-outline"
              @click="concluirTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
              Haga clic para completar la tarea
            </q-tooltip>
          </q-btn>
          <q-btn
              flat
              round
              :class="$q.dark.isActive ? ('text-white') : ''"
              icon="mdi-content-copy"
              @click="duplicarTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
              Haga clic para duplicar la tarea
            </q-tooltip>
          </q-btn>
          <q-btn
              v-if="userProfile === 'admin'"
              flat
              round
              :class="$q.dark.isActive ? ('text-white') : ''"
              icon="eva-edit-outline"
              @click="editarTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
              Haga clic para editar la tarea
            </q-tooltip>
          </q-btn>
          <q-btn
              v-if="userProfile === 'admin'"
              flat
              round
              icon="eva-trash-outline"
              @click="deletarTarefa(props.row)"
              :class="$q.dark.isActive ? ('text-white') : ''"
              >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
              Haga clic para eliminar la tarea
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalTarefa
      :modalTarefa.sync="modalTarefa"
      :tarefaEdicao.sync="tarefaEdicao"
      @modal-tarefa:criada="tarefaCriada"
      @modal-tarefa:editada="tarefaEditada"
    />
  </div>
</template>

<script>
import { DeletarTarefa, ListarTarefas, AlterarTarefa, CriarTarefa } from 'src/service/tarefas'
import ModalTarefa from './ModalTarefa'
export default {
  name: 'Tarefas',
  components: {
    ModalTarefa
  },
  data () {
    return {
      userProfile: 'user',
      params: {
        searchParam: null
      },
      filter: null,
      tarefaEdicao: {},
      modalTarefa: false,
      tarefas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'status', label: 'Estado', field: 'status', align: 'left', format: (val) => this.formatStatus(val) },
        { name: 'name', label: 'Tarea', field: 'name', align: 'left' },
        { name: 'description', label: 'Descripción', field: 'description', align: 'left', format: (val) => this.formatComments(val) },
        { name: 'limitDate', label: 'Fecha Limite', field: 'limitDate', align: 'left', format: (val) => this.formatDate(val) },
        { name: 'owner', label: 'Responsable', field: 'owner', align: 'left' },
        { name: 'priority', label: 'Prioridad', field: 'priority', align: 'left', format: (val) => this.formatPriority(val) },
        { name: 'comments', label: 'Comentario', field: 'comments', align: 'left', format: (val) => this.formatComments(val) },
        { name: 'acoes', label: 'Acciones', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarTarefas() {
      const { data } = await ListarTarefas()

      let tarefas = []
      if (this.userProfile === 'admin') {
        tarefas = data
      } else {
        tarefas = data.filter((e) => e.owner === localStorage.getItem('username'))
      }

      const statusOrder = { delayed: 1, pending: 2, finished: 3 }
      const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 }

      tarefas.sort((a, b) => {
        if (a.status === 'finished' && b.status !== 'finished') {
          return 1
        }
        if (a.status !== 'finished' && b.status === 'finished') {
          return -1
        }

        const dateA = new Date(a.limitDate)
        const dateB = new Date(b.limitDate)

        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB
        }

        const statusComparison = statusOrder[a.status] - statusOrder[b.status]
        if (statusComparison !== 0) return statusComparison

        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

      this.tarefas = tarefas
    },
    async listarTarefasFiltro() {
      this.loading = true
      const response = await ListarTarefas()
      const tarefas = response.data
      try {
        const searchTerm = this.params.searchParam.toLowerCase()
        const tarefasFiltradas = tarefas.filter(tarefa => {
          const tarefaAsString = JSON.stringify(tarefa).toLowerCase()
          return tarefaAsString.includes(searchTerm)
        })
        this.LOAD_TAREFAS(tarefasFiltradas)
      } catch (e) {
        this.tarefas = response.data
      }
      this.loading = false
    },

    filtrarTarefa(data) {
      this.tarefas = []
      this.params.searchParam = data
      this.loading = true
      this.listarTarefasFiltro()
      this.loading = false
    },

    LOAD_TAREFAS(tarefasFiltradas) {
      this.tarefas = tarefasFiltradas
    },

    formatComments(comment) {
      if (comment && comment.length > 30) {
        return comment.substring(0, 30) + '...'
      }
      return comment
    },

    formatStatus(value) {
      const statusMap = {
        delayed: '⚠️ Atrasado',
        pending: '🕒 En curso',
        finished: '🎉 Completa'
      }
      return statusMap[value] || value
    },

    formatPriority(value) {
      const priorityMap = {
        high: '⏰ Urgente',
        medium: '⌛ Moderado',
        low: '🕗 Poca urgencia',
        none: '🕰️ Sin Prisa'
      }
      return priorityMap[value] || value
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    },

    tarefaCriada(tarefa) {
      const newTarefas = [...this.tarefas]
      newTarefas.push(tarefa)
      this.tarefas = [...newTarefas]
    },

    tarefaEditada(tarefa) {
      const newTarefas = [...this.tarefas]
      const idx = newTarefas.findIndex(f => f.id === tarefa.id)
      if (idx > -1) {
        newTarefas[idx] = tarefa
      }
      this.tarefas = [...newTarefas]
    },

    editarTarefa(tarefa) {
      this.tarefaEdicao = { ...tarefa }
      this.modalTarefa = true
    },

    async concluirTarefa(tarefa) {
      this.loading = true
      try {
        const tarefaAtualizada = {
          ...tarefa,
          status: 'finished'
        }
        const { data } = await AlterarTarefa(tarefaAtualizada)
        this.$emit('modal-tarefa:editada', data)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: '¡Tarea terminada!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        window.location.reload()
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    },

    async duplicarTarefa(tarefa) {
      this.loading = true
      try {
        const tarefaAtualizada = {
          ...tarefa
        }
        const { data } = await CriarTarefa(tarefaAtualizada)
        this.$emit('modal-tarefa:criada', data)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: '¡Tarea duplicada!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        window.location.reload()
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    },

    async checarAtrasadas() {
      try {
        const { data } = await ListarTarefas()
        let tarefasAtualizadas = false
        const atualizacoes = data.map(async (tarefa) => {
          const limitDate = new Date(tarefa.limitDate)
          const hoje = new Date()
          if ((limitDate < hoje && tarefa.status !== 'finished')) {
            const tarefaAtualizada = {
              ...tarefa,
              status: 'delayed'
            }
            await AlterarTarefa(tarefaAtualizada)
            tarefasAtualizadas = true
          }
        })
        await Promise.all(atualizacoes)
        if (tarefasAtualizadas) {
        //  window.location.reload();
        }
      } catch (error) {
        console.error('Error al verificar tareas atrasadas:', error)
      }
    },

    deletarTarefa(tarefa) {
      this.$q.dialog({
        title: '¡¡Atención!!',
        message: `¿Desea realmente eliminar la Tarea "${tarefa.name}"?`,
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
        DeletarTarefa(tarefa)
          .then(res => {
            let newTarefas = [...this.tarefas]
            newTarefas = newTarefas.filter(f => f.id !== tarefa.id)
            this.tarefas = [...newTarefas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `¡Tarea ${tarefa.name} eliminada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }
  },
  mounted () {
    this.listarTarefas()
    this.checarAtrasadas()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
