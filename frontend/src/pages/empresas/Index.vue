<template>
  <div class="q-pa-md" style="max-width: 100%">
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-primary"
        active-color="green"
        indicator-color="green"
        align="justify"
      >
        <q-tab name="Dashboard" label="Panel" />
        <q-tab name="empresas" label="Empresas" />
        <q-tab name="planos" label="Planes" />
        <q-tab name="ajuda" label="Ayuda" />
        <q-tab name="config" label="Configuraciones" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Dashboard" class="q-pa-none">
          <dashboard/>
        </q-tab-panel>

        <q-tab-panel name="empresas">
          <empresa/>
        </q-tab-panel>

        <q-tab-panel name="planos">
          <planos/>
        </q-tab-panel>

        <q-tab-panel name="ajuda">
          <ajuda/>
        </q-tab-panel>

        <q-tab-panel name="config">
          <config/>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import empresa from './empresa.vue'
import dashboard from './dashboard/index.vue'
import planos from './planos/Index.vue'
import ajuda from './ajuda/Index.vue'
import config from './config/Index.vue'

export default {
  data () {
    return {
      tab: 'Dashboard', // Define el nombre de la pestaña que deseas abrir por defecto
      innerTab: 'innerMails',
      splitterModel: 20
    }
  },
  components: {
    empresa,
    dashboard,
    planos,
    ajuda,
    config
  }
}
</script>
