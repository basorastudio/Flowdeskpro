<template>
  <div class="bg-white mass-container container-rounded-10">
    <dashboard/>
    <UltilizacaoVps/>
  </div>
</template>

<script>
import UltilizacaoVps from './UltilizacaoVps.vue'
import dashboard from './dashboard.vue'

export default {
  components: {
    dashboard,
    UltilizacaoVps
  }
}
</script>
