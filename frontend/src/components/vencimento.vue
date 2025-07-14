<template>
  <div :class="['text-caption text-center q-pa-sm', { 'bg-red': isDueSoon }]">
    <q-badge align="middle" color="primary">
      {{ duedate }}
    </q-badge>
  </div>
</template>

<script>
import { MostrarVencimento } from 'src/service/empresas'
import { format, parseISO, differenceInDays } from 'date-fns'

export default {
  name: 'Vencimento',
  data() {
    return {
      duedate: null,
      isDueSoon: false
    }
  },
  methods: {
    async listarDate() {
      const { data } = await MostrarVencimento()
      const dueDate = parseISO(data.dueDate)
      const formattedDate = format(dueDate, 'dd/MM/yyyy')
      this.duedate = formattedDate

      const today = new Date()
      const daysUntilDue = differenceInDays(dueDate, today)

      if (daysUntilDue <= 3 && daysUntilDue > 0) {
        this.isDueSoon = true
      } else if (daysUntilDue <= 0) {
        this.isDueSoon = true
        this.$router.push('/financeiro')
      }
    }
  },
  async mounted() {
    await this.listarDate()
  }
}
</script>

<style>
.bg-red {
  background-color: red;
}
</style>
