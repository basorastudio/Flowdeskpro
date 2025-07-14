<template>
  <q-dialog
    @show="fetchContact"
    @hide="$emit('update:modalContato', false)"
    :value="modalContato"
    persistent
  >
    <q-card class="q-pa-md modal-container container-rounded-10">
      <q-card-actions align="right" class="q-mt-lg">
        <q-btn flat dense icon="eva-close" color="negative" v-close-popup class="q-px-md" />
      </q-card-actions>

      <q-card-section>
        <div class="text-h6 text-center font-family-main">
          {{ contactId ? 'Editar Contacto' : 'Agregar Contacto' }}
        </div>
      </q-card-section>

      <div class="row flex-gap-1" style="gap: 1vh">
        <div class="full-width container-border container-rounded-10 q-ml-lg q-mr-lg">
        <q-card-section class="q-py-sm text-bold font-family-main">
        Datos del Contacto
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <c-input
          class="col-12 col-md-6"
          rounded
          outlined
          v-model="contato.name"
          :validator="$v.contato.name"
          @blur="$v.contato.name.$touch"
          label="Nombre"
        />
        <c-input
          class="col-12 col-md-6 "
          rounded
          outlined
          v-model="contato.number"
          :validator="$v.contato.number"
          @blur="$v.contato.number.$touch"
          mask="+#############"
          placeholder="+DDI (DDD) 99999 9999"
          fill-mask
          unmasked-value
          hint="El número del celular deberá contener al menos 9 dígitos y estar precedido por el código de marcación."
          label="Número"
        />
        <c-input
          class="col-12"
          outlined
          rounded
          :validator="$v.contato.email"
          @blur="$v.contato.email.$touch"
          v-model="contato.email"
          label="Correo Electrónico"
        />
        <q-checkbox
          v-model="contato.disableBot"
          label="Desactivar BOT"
        />
        <q-checkbox
          v-model="contato.disableCampaign"
          label="Desactivar Campaña"
        />
      </q-card-section>
      </div>

        <div class="full-width container-border container-rounded-10 q-ml-lg q-mr-lg">
        <q-card-section>
        <q-card
          class="bg-white q-mt-sm btn-rounded"
          bordered
          flat
        >
          <q-card-section class="font-family-main text-bold q-pb-none">
            Cartera
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-select
              square
              borderless
              v-model="contato.wallets"
              multiple
              :max-values="1"
              :options="usuarios"
              use-chips
              option-value="id"
              option-label="name"
              emit-value
              map-options
              dropdown-icon="add"
              class="col-12"
            >
              <!-- templates para opciones del q-select -->
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item
                  v-bind="itemProps"
                  v-on="itemEvents"
                >
                  <q-item-section>
                    <q-item-label v-html="opt.name"></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      :value="selected"
                      @input="toggleOption(opt)"
                    />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  dense
                  square
                  color="white"
                  text-color="primary"
                  class="q-ma-xs row col-12 text-body1"
                >
                  {{ opt.name }}
                </q-chip>
              </template>
              <template v-slot:no-option="{ itemProps, itemEvents }">
                <q-item
                  v-bind="itemProps"
                  v-on="itemEvents"
                >
                  <q-item-section>
                    <q-item-label class="text-negative text-bold">
                      ¡Ups... Sin carteras disponibles!
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </q-card-section>
      <q-card-section>
        <q-card
          class="bg-white q-mt-sm btn-rounded"
          bordered
          flat
        >

          <q-card-section class="font-family-main text-bold q-pb-none">
            Etiqueta
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-select
              square
              borderless
              v-model="contato.tags"
              multiple
              :options="etiquetas"
              use-chips
              option-value="id"
              option-label="tag"
              emit-value
              map-options
              dropdown-icon="add"
              class="col-12"
            >
              <!-- templates para opciones del q-select -->
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item
                  v-bind="itemProps"
                  v-on="itemEvents"
                >
                  <q-item-section>
                    <q-item-label v-html="opt.tag"></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      :value="selected"
                      @input="toggleOption(opt)"
                    />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  dense
                  square
                  color="white"
                  text-color="primary"
                  class="q-ma-xs row col-12 text-body1"
                >
                  <q-icon :style="{ color: opt.color }" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                  {{ opt.tag }}
                </q-chip>
              </template>
              <template v-slot:no-option="{ itemProps, itemEvents }">
                <q-item
                  v-bind="itemProps"
                  v-on="itemEvents"
                >
                  <q-item-section>
                    <q-item-label class="text-negative text-bold">
                      ¡Ups... Sin etiquetas disponibles!
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </q-card-section>
      </div>

      <div class="full-width container-border container-rounded-10 q-ml-lg q-mr-lg">
        <q-card-section class="font-family-main q-py-sm text-bold">
        Información adicional
      </q-card-section>

      <q-card-section class="row q-col-gutter-md justify-center">
        <template v-for="(extraInfo, index) in contato.extraInfo">
          <div :key="index" class="col-12 row justify-center q-col-gutter-sm">
            <q-input
              class="col-12 col-md-6"
              outlined
              v-model="extraInfo.name"
              label="Descripción"
            />
            <q-input
              class="col-12 col-md-6"
              outlined
              label="Información"
              v-model="extraInfo.value"
            />
            <div class="col q-pt-md">
              <q-btn
                :key="index"
                icon="delete"
                round
                flat
                color="negative"
                @click="removeExtraInfo(index)"
              />
            </div>
          </div>
        </template>
        <div class="col-12">
          <q-btn
            class="full-width"
            color="primary"
            outline
            label="Agregar Información"
            @click="contato.extraInfo.push({ name: null, value: null })"
          />
        </div>
      </q-card-section>
      </div>
      </div>

      <q-card-actions align="right" class="q-mt-lg">
        <q-btn class="q-px-md btn-rounded-50" label="Cancelar" color="negative" v-close-popup />
        <q-btn class="q-ml-lg q-px-md btn-rounded-50" icon="eva-save-outline" label="Guardar" color="primary" @click="saveContact" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { ObterContato, CriarContato, EditarContato, EditarEtiquetasContato } from 'src/service/contatos'
import { ListarUsuarios } from 'src/service/user'
import { ListarEtiquetas } from 'src/service/etiquetas'
export default {
  name: 'ContatoModal',
  props: {
    modalContato: {
      type: Boolean,
      default: false
    },
    contactId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      contato: {
        name: null,
        number: null,
        email: '',
        extraInfo: [],
        wallets: [],
        tags: [],
        disableBot: false,
        disableCampaign: false
      },
      usuarios: [],
      etiquetas: []
    }
  },
  validations: {
    contato: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { email },
      number: { required, minLength: minLength(8) }
    }
  },
  methods: {
    async fetchContact () {
      try {
        await this.listarUsuarios()
        if (!this.contactId) return
        const { data } = await ObterContato(this.contactId)
        this.contato = data
        if (data.number.substring(0, 2) === '55') {
          this.contato.number = data.number.substring(0)
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('¡Ocurrió un error!', error)
      }
    },
    removeExtraInfo (index) {
      const newData = { ...this.contato }
      newData.extraInfo.splice(index, 1)
      this.contato = { ...newData }
    },
    async saveContact() {
      this.$v.contato.$touch()
      if (this.$v.contato.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: '¡Ups! Verifique los errores...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      const contato = {
        ...this.contato,
        number: '' + this.contato.number // insertar el DDI de Brasil para consultar el número
      }

      try {
        if (this.contactId) {
          const { data } = await EditarContato(this.contactId, contato)
          await EditarEtiquetasContato(this.contactId, [...this.contato.tags])
          this.$emit('contatoModal:contato-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: '¡Contacto editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarContato(contato)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: '¡Contacto creado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('contatoModal:contato-criado', data)
        }
        this.$emit('update:modalContato', false)
      } catch (error) {
        console.error('Error capturado: ', error)

        // Verificar si el error es "NOT_FOUND_WHATSAPP_CONNECTED" o "CONTACT_NOT_FOUND"
        if (error.data && error.data.error === 'NOT_FOUND_WHATSAPP_CONNECTED') {
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: 'No encontramos WhatsApp Conectado',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else if (error.data && error.data.error === 'CONTACT_NOT_FOUND') {
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: 'No encontramos WhatsApp en el número que intentó registrar',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          this.$notificarErro('Ocurrió un error al crear el contacto', error)
        }
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar usuarios', error)
      }
    },
    async listarEtiquetas() {
      try {
        const { data } = await ListarEtiquetas(true)
        this.etiquetas = data
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema al cargar etiquetas', error)
      }
    }
    // async tagSelecionada(tags) {
    //   await EditarEtiquetasContato(this.contactId, [...tags])
    // },
  },
  beforeMount() {
    this.listarEtiquetas()
  },
  destroyed () {
    this.$v.contato.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
