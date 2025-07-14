<template>
  <q-dialog
    persistent
    :value="modalFilaUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card class="q-pa-lg container-rounded-10">
      <q-card-section class="q-pa-none">
        <div class="full-width text-h6 row col font-family-main q-pa-sm">Filas Usuario</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm q-pt-sm"
        >Nombre: {{ usuarioSelecionado.name }}</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm"
        >Correo electrónico: {{ usuarioSelecionado.email }}</div>
        <q-separator spaced />
      </q-card-section>
      <q-card-section>
        <template v-for="fila in filas">
          <div
            class="row col"
            :key="fila.id"
          >
            <q-checkbox
              :disable="!fila.isActive"
              v-model="filasUsuario"
              :label="`${fila.queue} ${!fila.isActive ? '(Inactivo)' : ''}`"
              :val="fila.id"
            />
          </div>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Cancelar"
          class="q-px-md q-mr-sm btn-rounded-50"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Salvar"
          class="btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handleFilaUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { UpdateUsuarios } from 'src/service/user'
export default {
  name: 'ModalFilaUsuario',
  props: {
    modalFilaUsuario: {
      type: Boolean,
      default: false
    },
    usuarioSelecionado: {
      type: Object,
      default: () => { return { id: null } }
    },
    filas: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      filasUsuario: []
    }
  },
  methods: {
    abrirModal () {
      if (this.usuarioSelecionado.id) {
        this.filasUsuario = [...this.usuarioSelecionado.queues.map(f => f.id)]
      }
    },
    fecharModal () {
      this.$emit('update:usuarioSelecionado', {})
      this.$emit('update:modalFilaUsuario', false)
    },
    async handleFilaUsuario () {
      const req = {
        ...this.usuarioSelecionado,
        queues: [...this.filasUsuario]
      }
      const { data } = await UpdateUsuarios(req.id, req)
      this.$emit('modalFilaUsuario:sucesso', data)
      this.$q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: '¡Las filas de usuario editadas con éxito!',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.fecharModal()
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
