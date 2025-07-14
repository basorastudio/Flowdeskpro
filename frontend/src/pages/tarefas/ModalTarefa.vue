<template>
  <div>
    <q-dialog
      persistent
      :value="modalTarefa"
      @hide="fecharModal"
      @show="abrirModal"
    >
      <q-card
        class="q-pa-lg modal-container container-rounded-10"
      >
      <q-card-actions
          align="right"
          class="q-mt-md"
        >
          <q-btn
          flat
            color="negative"
            v-close-popup
            class="btn-rounded-50"
            icon="eva-close"
          />
        </q-card-actions>
        <q-card-section>
          <div class="text-h6 text-center font-family-main">{{ tarefaEdicao.id ? 'Editar': 'Crear' }} Tarea</div>
        </q-card-section>

        <q-form ref="taskForm">
        <q-card-section class="container-rounded-10 container-border">
          <div class="text-h6 font-family-main q-mb-sm">
            Información
          </div>
          <q-input
            class="row col"
            rounded
            outlined
            v-model="tarefa.name"
            label="Nombre"
            :rules="[val => !!val || 'El campo de nombre es obligatorio']"
          />
          <q-input
            class="row col"
            rounded
            outlined
            v-model="tarefa.description"
            label="Descripción"
            type="textarea"
            autogrow
            :rules="[val => !!val || 'El campo de descripción es obligatorio']"
          />
          <q-input
            class="row col"
            rounded
            outlined
            v-model="tarefa.limitDate"
            label="Fecha Limite"
            readonly
            @click="openCalendar = true"
            :rules="[val => !!val || 'El campo de fecha límite es obligatorio']"
          />
          <q-select
            class="row col"
            rounded
            outlined
            v-model="tarefa.owner"
            label="Responsable"
            :options="userOptions"
            @input="updateUser"
            :rules="[val => !!val || 'El campo responsable es obligatorio']"
          />
          <q-select
            class="row col"
            rounded
            outlined
            v-model="tarefa.priority"
            label="Prioridad"
            :options="priorityOptions"
            @input="updatePrioridade"
            :rules="[val => !!val || 'El campo prioritario es obligatorio']"
          />
          <q-input
            class="row col"
            rounded
            outlined
            v-model="tarefa.comments"
            label="Comentario"
            type="textarea"
            autogrow
          />
        </q-card-section>
        <q-card-actions
          align="right"
          class="q-mt-md"
        >
          <q-btn
            label="Cancelar"
            color="negative"
            v-close-popup
            class="q-mr-md btn-rounded-50"
          />
          <q-btn
            label="Salvar"
            icon="eva-save-outline"
            @click="validateForm"
            class="generate-button btn-rounded-50"
          />
        </q-card-actions>
        </q-form>

      </q-card>
    </q-dialog>

    <q-dialog v-model="openCalendar">
      <q-date
        v-model="tarefa.limitDate"
        mask="YYYY-MM-DD"
        @input="openCalendar = false"
      />
    </q-dialog>
  </div>

</template>

<script>
import { CriarTarefa, AlterarTarefa } from 'src/service/tarefas'
import { ListarUsuarios } from 'src/service/user'

export default {
  name: 'ModalTarefa',
  props: {
    modalTarefa: {
      type: Boolean,
      default: false
    },
    tarefaEdicao: {
      type: Object,
      default: () => ({ id: null })
    }
  },
  data() {
    return {
      openCalendar: false,
      tarefa: this.inicializarTarefa(),
      priorityOptions: [
        { label: '⏰ Urgente', value: 'high' },
        { label: '⌛ Moderado', value: 'medium' },
        { label: '🕗 Poca urgencia', value: 'low' },
        { label: '🕰️ Sin Prisa', value: 'none' }
      ],
      userOptions: []
    }
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('profile') === 'admin'
    }
  },
  methods: {
    inicializarTarefa() {
      return {
        id: null,
        name: null,
        description: null,
        limitDate: null,
        owner: null,
        priority: null,
        comments: null
      }
    },
    async validateForm() {
      const valid = await this.$refs.taskForm.validate()
      if (valid) {
        this.handleTarefa()
      } else {
        this.notificarErro('Complete todos los campos obligatorios')
      }
    },
    async listarUsuarios() {
      try {
        const profile = localStorage.getItem('profile')
        const username = localStorage.getItem('username')

        if (profile === 'admin') {
          const { data } = await ListarUsuarios()
          this.userOptions = data.users.map(user => ({
            label: user.name,
            value: user.name
          }))
        } else {
          this.userOptions = [{ label: username, value: username }]
        }
      } catch (error) {
        this.notificarErro('Problema al cargar usuarios', error)
      }
    },
    updateUser(selectedOption) {
      this.tarefa.owner = selectedOption.value
    },
    updatePrioridade(selectedOption) {
      this.tarefa.priority = selectedOption.value
    },
    resetarTarefa() {
      this.tarefa = this.inicializarTarefa()
    },
    fecharModal() {
      this.resetarTarefa()
      this.$emit('update:tarefaEdicao', { id: null })
      this.$emit('update:modalTarefa', false)
    },
    abrirModal() {
      this.tarefa = this.tarefaEdicao.id ? { ...this.tarefaEdicao } : this.inicializarTarefa()
    },
    async handleTarefa() {
      this.loading = true
      try {
        const { data } = this.tarefa.id
          ? await AlterarTarefa(this.tarefa)
          : await CriarTarefa(this.tarefa)

        const evento = this.tarefa.id ? 'modal-tarefa:editada' : 'modal-tarefa:criada'
        this.$emit(evento, data)

        this.notificarSucesso(
          this.tarefa.id ? '¡Tarea editada!' : '¡Tarea creada!'
        )
        this.fecharModal()
      } catch (error) {
        this.notificarErro('Se produjo un error al procesar la tarea', error)
      } finally {
        this.loading = false
      }
    },
    notificarErro(mensagem, erro = null) {
      console.error(erro)
      this.$q.notify({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: mensagem
      })
    },
    notificarSucesso(mensagem) {
      this.$q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: mensagem,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    }
  },
  async mounted() {
    await this.listarUsuarios()
  }
}
</script>

<style lang="scss" scoped>
</style>
