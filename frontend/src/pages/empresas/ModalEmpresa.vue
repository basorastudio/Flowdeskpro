<template>
  <q-dialog persistent :value="modalEmpresa" @hide="fecharModal" @show="abrirModal">
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
        <div class="text-h6 text-center font-family-main">{{tenant.name ? "Editar" : "Registrar"}} Empresa</div>
      </q-card-section>
      <div class="container-border container-rounded-10">

      <q-card-section class="row flex-gap-1 q-col-gutter-sm">
        <div class="text-h6 font-family-main">
          Información
        </div>
        <div class="flex-gap-1 full-width row q-col-gutter-sm">
          <div class="full-width">
            <c-input outlined v-model.trim="tenant.name" :validator="$v.tenant.name" @blur="$v.tenant.name.$touch" rounded
              label="Nombre" />
          </div>
          <div class="full-width">
            <c-input outlined v-model.trim="tenant.cnpj" mask="###-#######-#" label="RNC/CEDULA" rounded
               />
          </div>
          <div class="full-width">
            <c-input outlined v-model.trim="tenant.phone" mask="#(###)###-####" label="Whatsapp" rounded
              :validator="$v.tenant.phone" @blur="$v.tenant.phone.$touch" />
          </div>
          <div class="full-width">
          <q-datetime-picker
            rounded
            outlined
            label="Fecha/Hora de Vencimiento"
            mode="datetime"
            color="primary"
            format24h
            v-model="tenant.dueDate"
            @blur="$v.tenant.dueDate.$touch"
            :error="$v.tenant.dueDate.$error"
            error-message="No puede ser anterior al día actual"
          />
          </div>
          <div class="full-width">
              <!-- Plano (seleção) -->
              <q-select rounded
                v-model="tenant.planId"
                :options="options"
                label="Plano"
                outlined
              />
          </div>
          </div>
        </div>
      <q-card-section class="q-col-gutter-sm" v-if="!isEdit">
        <div class="text-h6">Registrar Usuario Responsable</div>
        <div class="row q-col-gutter-sm">
          <div class="full-width">
            <c-input outlined v-model.trim="usuario.name" :validator="$v.usuario.name" @blur="$v.usuario.name.$touch" rounded
              label="Nombre" />
          </div>
          <div class="full-width">
            <c-input outlined :validator="$v.usuario.email" @blur="$v.usuario.email.$touch" v-model.trim="usuario.email" rounded
              label="Correo electrónico" />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="full-width">
            <c-input outlined v-model="usuario.password" :validator="$v.usuario.password" rounded
              @blur="$v.usuario.password.$touch" :type="isPwd ? 'password' : 'text'" label="Contraseña">
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
            </c-input>
          </div>
        </div>
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
import { CriarTenant, AdminUpdateEmpresa } from 'src/service/empresas'
import { list } from 'src/service/plans'

export default {
  name: 'ModalEmpresa',
  props: {
    modalEmpresa: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    tenantSelecionado: {
      type: Object,
      default: () => { return { id: null } }
    }
  },
  data() {
    return {
      isPwd: true,
      tenant: {
        name: '',
        email: '',
        cnpj: '',
        password: '',
        phone: '',
        dueDate: '',
        plano: null
      },
      planos: [],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: ''
      }
    }
  },
  computed: {
    options() {
      return this.formattedPlanos()
    }
  },
  validations: {
    tenant: {
      name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(50)
      },
      phone: {
        required
      },
      dueDate: {
        required
      }
    },
    usuario: {
      name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(50)
      },
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(50)
      }
    }
  },
  methods: {
    async fetchPlanData() {
      try {
        const response = await list()
        this.planos = response.data
        // console.log('Planos fetched:', this.planos) // Log para verificar os dados recebidos
      } catch (error) {
        console.error('Error de obtener datos del plan:', error)
      }
    },
    formattedPlanos() {
      const formatted = this.planos.map(plan => ({
        label: `${plan.name} - Asistente: ${plan.maxUsers} - Canales: ${plan.maxConnections} - USD$ ${plan.value.toFixed(2).replace('.', ',')}`,
        value: plan.id,
        maxUsers: plan.maxUsers,
        maxConnections: plan.maxConnections
      }))
      // console.log('Formatted Planos:', formatted) // Log para verificar os dados formatados
      return formatted
    },
    async handleUsuario() {
      if (this.tenantSelecionado.id) {
        await this.handleEdit()
      } else {
        await this.handleInsert()
      }
    },
    async handleInsert() {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }

      const { name, email, password } = this.usuario
      const { name: tenantName, cnpj, phone, dueDate, planId } = this.tenant
      const data = {
        name,
        email,
        password,
        tenantName,
        cnpj,
        phone,
        dueDate,
        planId
      }

      const tenant = await CriarTenant(data)

      this.$store.commit('EMPRESAS_ADMIN', { action: 'add', data: tenant.data.tenant })

      this.$q.notify({
        type: 'positive',
        message: 'Compañía registrada con éxito.',
        position: 'top',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })

      this.fecharModal()
    },
    async handleEdit() {
      if (this.$v.tenant.$invalid) {
        this.$v.tenant.$touch()
        return
      }
      const { name, cnpj, phone, dueDate, planId } = this.tenant
      const data = {
        name,
        cnpj,
        phone,
        dueDate,
        planId
      }
      const tenant = await AdminUpdateEmpresa(this.tenantSelecionado.id, data)

      this.$store.commit('EMPRESAS_ADMIN', { action: 'update', data: tenant.data })

      this.$q.notify({
        type: 'positive',
        message: 'La empresa cambió con éxito.',
        position: 'top',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })

      this.fecharModal()
    },
    abrirModal() {
      this.isPwd = true
      if (this.tenantSelecionado.id) {
        this.tenant = {
          name: this.tenantSelecionado.name,
          cnpj: this.tenantSelecionado.cnpj,
          phone: this.tenantSelecionado.phone,
          dueDate: this.tenantSelecionado.dueDate,
          plano: this.tenantSelecionado.PlanId
        }
      }
    },
    fecharModal() {
      this.usuario = {
        name: '',
        email: '',
        password: ''
      }
      this.tenant = {
        name: '',
        cnpj: '',
        status: 'active',
        phone: '',
        dueDate: '',
        plano: ''
      }
      this.$v.usuario.$reset()
      this.$v.tenant.$reset()
      this.$emit('update:isEdit', false)
      this.$emit('update:modalEmpresa', false)
      this.$emit('update:tenantSelecionado', {})
      this.isPwd = true
    }
  },
  mounted() {
    this.fetchPlanData()
  }
}

</script>
<style lang="scss" scoped></style>
