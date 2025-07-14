<template>
  <div v-if="informative?.value === 'enabled'" :style="{ backgroundColor: colorinformative.value }" class="q-pa-sm text-center">
    <b :style="{ color: colorinformativetext.value }">{{ textinformative.value }}</b>
  </div>
</template>

<script>
import { ListarConfiguracoesGeneral } from 'src/service/configuracoesgeneral'

export default {
  name: 'Informativo',
  data() {
    return {
      informative: null,
      textinformative: null,
      colorinformative: null,
      colorinformativetext: null
    }
  },
  async mounted() {
    const { data } = await ListarConfiguracoesGeneral()
    this.configuracoes = data
    this.informative = this.configuracoes.find(item => item.key === 'informative')
    if (this.informative?.value === 'enabled') {
      this.textinformative = this.configuracoes.find(item => item.key === 'textinformative')
      this.colorinformative = this.configuracoes.find(item => item.key === 'colorinformative')
      this.colorinformativetext = this.configuracoes.find(item => item.key === 'colorinformativetext')
    }
  }
}
</script>
