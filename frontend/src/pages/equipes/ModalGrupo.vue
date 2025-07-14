<template>
  <q-dialog persistent :value="modalGrupo" @hide="fecharModal" @show="abrirModal">
    <q-card class="q-pa-lg modal-container container-rounded-10">
      <q-card-actions align="right" class="q-mt-md">
        <q-btn flat icon="eva-close" class="btn-rounded-50" color="negative" v-close-popup />
      </q-card-actions>
      <q-card-section>
        <div class="text-h6 text-center font-family-main">{{ grupoEdicao.id ? 'Editar' : 'Crear' }} Equipo</div>
      </q-card-section>
      <q-card-section class="q-pa-lg container-border container-rounded-10">
        <div class="text-h6 font-family-main q-mb-sm">
          Información
        </div>
        <div class="row">
          <div class="col-12">
            <q-input rounded outlined v-model="grupo.group" label="Nombre del equipo" />
          </div>
          <div class="col-6">
            <q-toggle v-model="grupo.isActive" label="Activo" />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mt-md">
        <q-btn label="Cancelar" class="q-mr-md btn-rounded-50" color="negative" v-close-popup />
        <q-btn label="Salvar" icon="eva-save-outline" class="generate-button btn-rounded-50" @click="handleGrupo" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarGrupo, AlterarGrupo } from 'src/service/grupos'
export default {
  name: 'ModalGrupo',
  props: {
    modalGrupo: {
      type: Boolean,
      default: false
    },
    grupoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data() {
    return {
      grupo: {
        id: null,
        grupo: null,
        isActive: true
      }
    }
  },
  methods: {
    resetarGrupo() {
      this.grupo = {
        id: null,
        grupo: null,
        isActive: true
      }
    },
    fecharModal() {
      this.resetarGrupo()
      this.$emit('update:grupoEdicao', { id: null })
      this.$emit('update:modalGrupo', false)
    },
    abrirModal() {
      if (this.grupoEdicao.id) {
        this.grupo = { ...this.grupoEdicao }
      } else {
        this.resetarGrupo()
      }
    },
    async handleGrupo() {
      try {
        this.loading = true
        if (this.grupo.id) {
          const { data } = await AlterarGrupo(this.grupo)
          this.$emit('modal-grupo:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Equipo editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarGrupo(this.grupo)
          this.$emit('modal-grupo:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Equipo creado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('¡Se produjo un error!', error)
      }
    }
  }

}
</script>

<style lang="scss" scoped></style>
