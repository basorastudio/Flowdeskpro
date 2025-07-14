<template>
  <q-dialog
    persistent
    :value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card class="container-rounded-10 modal-container q-pa-lg">

      <q-card-actions align="right">
        <q-btn
          flat
          color="negative"
          icon="eva-close-outline"
          v-close-popup
        />
      </q-card-actions>

      <q-card-section>
        <div class="text-h6 text-center font-family-main">{{usuario.name ? "Editar" : "Registrar"}} Usuario</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Información
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="$v.usuario.name"
              @blur="$v.usuario.name.$touch"
              label="Nombre"
              rounded
            />
          </div>
          <div class="full-width">
            <c-input
              outlined
              :validator="$v.usuario.email"
              @blur="$v.usuario.email.$touch"
              v-model.trim="usuario.email"
              label="Correo electrónico"
              rounded
            />
          </div>
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
            <c-input
              rounded
              outlined
              v-model="usuario.password"
              :validator="$v.usuario.password"
              @blur="$v.usuario.password.$touch"
              :type="isPwd ? 'password' : 'text'"
              label="Contraseña"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </c-input>
          </div>
          <div class="full-width">
            <q-select
              rounded
              :disable="isProfile"
              outlined
              v-model="usuario.profile"
              :options="optionsProfile"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Perfil"
            />
          </div>
        </div>
      </q-card-section>
      </div>

      <q-card-actions align="right">
        <q-btn
          label="Cancelar"
          class="q-px-md q-mr-sm btn-rounded-50"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Salvar"
          class="q-px-md btn-rounded-50 generate-button"
          icon="eva-save-outline"
          @click="handleUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { CriarUsuario, UpdateUsuarios } from 'src/service/user'
import { Notify } from 'quasar'
export default {
  name: 'ModalUsuario',
  props: {
    modalUsuario: {
      type: Boolean,
      default: false
    },
    isProfile: {
      type: Boolean,
      default: false
    },
    usuarioEdicao: {
      type: Object,
      default: () => { return { id: null } }
    }
  },
  data () {
    return {
      isPwd: false,
      optionsProfile: [
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' }
      ],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: 'user'
      }
    }
  },
  validations () {
    let usuario = {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { required, email },
      profile: { required },
      password: {}
    }
    if (!this.usuario.id) {
      usuario = {
        ...usuario,
        password: { required, minLength: minLength(6), maxLength: maxLength(50) }
      }
    }
    return { usuario }
  },
  methods: {
    abrirModal () {
      if (this.usuarioEdicao.id) {
        this.usuario = { ...this.usuarioEdicao }
      }
      if (this.usuarioEdicao.userId) {
        this.usuario = {
          ...this.usuarioEdicao,
          id: this.usuarioEdicao.userId,
          name: this.usuarioEdicao.username,
          profile: this.usuarioEdicao.profile
        }
      }
    },
    fecharModal () {
      if (!this.isProfile) {
        this.$emit('update:usuarioEdicao', {})
      }
      this.$emit('update:modalUsuario', false)
      this.usuario = {
        name: '',
        email: '',
        password: '',
        profile: 'user'
      }
      this.isPwd = false
      this.$v.usuario.$reset()
    },
    async handleUsuario () {
      this.$v.usuario.$touch()
      if (this.$v.usuario.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: '¡Ups! Verifique los errores ...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      try {
        if (this.usuario.id) {
          const {
            email, id, name, tenantId, password, profile
          } = this.usuario

          const params = { email, id, name, tenantId, password, profile }

          if (this.$store.state.user.isAdmin) {
            params.profile = this.usuario.profile
          }

          const { data } = await UpdateUsuarios(this.usuario.id, params)
          this.$emit('modalUsuario:usuario-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Usuario editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarUsuario(this.usuario)
          this.$emit('modalUsuario:usuario-criado', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Usuario creado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.$emit('update:modalUsuario', false)
      } catch (error) {
        console.error(error, error.data.error === 'ERR_USER_LIMIT_USER_CREATION')
        if (error.data.error === 'ERR_USER_LIMIT_USER_CREATION') {
          Notify.create({
            type: 'negative',
            message: 'Límite de usuario alcanzado.',
            caption: 'ERR_USER_LIMIT_USER_CREATION',
            position: 'top',
            progress: true
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
