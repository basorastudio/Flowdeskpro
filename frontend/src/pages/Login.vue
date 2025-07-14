<template>
  <div class="container">
    <div class="login-section">
      <q-layout class="full-width">
        <q-page-container>
          <q-page class="flex justify-center items-center">
            <q-ajax-bar
              position="top"
              color="primary"
              size="5px"
            />
            <div class="login-content">
              <q-img
                :src="generateMediaUrl()"
                spinner-color="white"
                class="logo-image q-mb-lg q-px-md"
                style="max-width: 100%"
              />
              <q-separator spaced />
              <div class="text-primary">
                <div class="text-h6">¡Bienvenido!</div>
                <div>
                  <q-input
                    rounded
                    :color="$q.dark.isActive ? 'white ' : 'black'"
                    class="q-mb-md"
                    clearable
                    v-model="form.email"
                    placeholder="su-correo@email.com"
                    @blur="$v.form.email.$touch"
                    :error="$v.form.email.$error"
                    error-message="Debe ser un correo electrónico válido."
                    outlined
                    @keypress.enter="fazerLogin"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-email-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    rounded
                    :color="$q.dark.isActive ? 'white ' : 'black'"
                    outlined
                    v-model="form.password"
                    :type="isPwd ? 'password' : 'text'"
                    @keypress.enter="fazerLogin"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-shield-key-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
              <q-btn v-if="habilitasmtpEnabled" flat color="info" no-caps dense class="q-px-sm" label="Olvidé la contraseña" @click="modalEsqueciSenha = true" />
                </div>
              <q-btn v-if="allowSignupEnabled" flat color="info" no-caps dense class="q-px-sm" label="¡Regístrese, ahora mismo!" @click="redirecionarParaCadastro" />
                <q-btn
                  class="q-mr-sm q-my-lg generate-button btn-rounded-50"
                  style="width: 150px"
                  :loading="loading"
                  @click="fazerLogin"
                >
                  Entrar
                  <span slot="loading">
                    <q-spinner-puff class="on-left" />Entrando...
                  </span>
                </q-btn>
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </div>

<!-- Modal de Recuperação de Senha -->
<q-dialog v-model="modalEsqueciSenha" persistent>
  <q-card class="q-pa-md" style="max-width: 400px; margin: auto;">
    <q-card-section>
      <div class="row items-center">
        <div class="col text-h6 text-center">Recuperar contraseña</div>
        <q-btn dense flat round icon="close" @click="modalEsqueciSenha = false" class="modal-close-btn col-auto" />
      </div>
    </q-card-section>
    <q-card-section>
      <q-form @submit.prevent="enviarEmail" class="flex flex-center column">
        <q-input
          rounded
          :color="$q.dark.isActive ? 'white ' : 'black'"
          clearable
          v-model="emailRedefinicao"
          placeholder="su-correo@email.com"
          @blur="$v.form.email.$touch"
          :error="$v.form.email.$error"
          error-message="Debe ser un correo electrónico válido."
          outlined
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon
              name="mdi-email-outline"
              class="cursor-pointer"
              color='primary'
            />
          </template>
        </q-input>
        <q-btn class="q-my-lg generate-button btn-rounded-50" style="width: 150px" type="submit">
          Enviar Email
        </q-btn>
      </q-form>
      <div v-if="showAdditionalFields" class="flex flex-center column">
        <q-input
          rounded
          :color="$q.dark.isActive ? 'white ' : 'black'"
          class="q-mb-md full-width"
          clearable
          v-model="codigoVerificacao"
          label="Código de verificación"
          outlined
        >
          <template v-slot:prepend>
            <q-icon
              name="mdi-keyboard"
              class="cursor-pointer"
              color='primary'
            />
          </template>
        </q-input>
        <q-input
          rounded
          :color="$q.dark.isActive ? 'white ' : 'black'"
          outlined
          v-model="novaSenha"
          :type="isPwd ? 'password' : 'text'"
          label="Nueva contraseña"
          class="q-mb-md full-width"
        >
          <template v-slot:prepend>
            <q-icon
              name="mdi-shield-key-outline"
              class="cursor-pointer"
              color='primary'
            />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-input
          rounded
          :color="$q.dark.isActive ? 'white ' : 'black'"
          outlined
          v-model="confirmarNovaSenha"
          :type="isPwd ? 'password' : 'text'"
          label="Confirmar una nueva contraseña"
          class="q-mb-md full-width"
        >
          <template v-slot:prepend>
            <q-icon
              name="mdi-shield-key-outline"
              class="cursor-pointer"
              color='primary'
            />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-btn class="q-my-lg generate-button btn-rounded-50" style="width: 150px" @click="redefinirSenha">
          Redefinir Contraseña
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</q-dialog>

  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { enviarEmailRedefinicao, redefinirSenha } from 'src/service/redifinirsenhas'
import { ListarConfiguracaoPublica } from 'src/service/configuracoesgeneral'

export default {
  name: 'Login',
  data () {
    return {
      modalEsqueciSenha: false,
      emailRedefinicao: '',
      codigoVerificacao: '',
      novaSenha: '',
      confirmarNovaSenha: '',
      showAdditionalFields: false,
      form: {
        email: null,
        password: null
      },
      contasCliente: {},
      isPwd: true,
      loading: false,
      allowSignupEnabled: false,
      habilitasmtpEnabled: false
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    },
    emailRedefinicao: { required, email },
    codigoVerificacao: { required },
    novaSenha: { required },
    confirmarNovaSenha: { required }
  },
  methods: {
    generateMediaUrl() {
      return `${process.env.VUE_URL_API}/public/logos/login.png`
    },
    async fetchConfigurations() {
      try {
        const response = await ListarConfiguracaoPublica()
        const configurations = response.data
        this.allowSignupEnabled = configurations.allowSignup === 'enabled'
        this.habilitasmtpEnabled = configurations.habilitasmtp === 'enabled'
      } catch (error) {
        console.error('Error al buscar configuración:', error)
      }
    },
    redirecionarParaCadastro() {
      this.$router.push('/signup')
    },
    fazerLogin () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Ingrese el usuario y la contraseña correctamente.')
        return
      }
      this.loading = true
      this.$store.dispatch('UserLogin', this.form)
        .then(data => {
          this.loading = false
        })
        .catch(err => {
          console.error('exStore', err)
          this.loading = false
        })
    },
    clear () {
      this.form.email = ''
      this.form.password = ''
      this.$v.form.$reset()
    },
    enviarEmail() {
      if (this.$v.emailRedefinicao.$invalid) {
        this.$v.emailRedefinicao.$touch()
        return
      }
      enviarEmailRedefinicao(this.emailRedefinicao)
        .then(response => {
          if (response.data.status === 404) {
            this.$q.notify({
              type: 'negative',
              message: 'Correo electrónico no encontrado'
            })
          } else {
            this.$q.notify({
              type: 'positive',
              message: '¡Correo electrónico enviado correctamente!'
            })
            this.showAdditionalFields = true
          }
        })
        .catch(err => {
          console.log('API Error:', err)
          this.$q.notify({
            type: 'negative',
            message: 'Error para enviar correo electrónico'
          })
        })
    },
    redefinirSenha() {
      if (this.novaSenha !== this.confirmarNovaSenha) {
        this.$q.notify({
          type: 'negative',
          message: 'Las contraseñas no corresponden'
        })
        return
      }
      redefinirSenha(this.emailRedefinicao, this.codigoVerificacao, this.novaSenha)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Contraseña redefinida exitosa.'
          })
          this.modalEsqueciSenha = false
          this.showAdditionalFields = false
        })
        .catch(err => {
          console.log('API Error:', err)
          this.$q.notify({
            type: 'negative',
            message: 'Error para redefinir la contraseña'
          })
        })
    }
  },
  mounted() {
    this.fetchConfigurations()
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
}

.login-section {
  width: 400px;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: white;
  border-radius: 10px
}

.full-width {
  width: 100%;
}

.login-content {
  text-align: center;
}

.video-container {
  display: flex;
  justify-content: flex-end;
  width: 55%;
}

.logo-image {
  height: auto;
  max-width: 100%;
}

.fixed-layout {
  width: 45%;
}

</style>
