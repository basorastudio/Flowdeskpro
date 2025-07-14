import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'quasar'
import { MostrarVencimento } from 'src/service/empresas'
import { parseISO, differenceInDays } from 'date-fns'
import routes from './routes'

Vue.use(VueRouter)

const Router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

const whiteListName = [
  'login'
]

Router.beforeEach(async (to, from, next) => {
  const token = JSON.parse(localStorage.getItem('token'))

  if (!token) {
    if (whiteListName.indexOf(to.name) === -1) {
      if (to.fullPath !== '/login' && to.fullPath !== '/signup' && !to.query.tokenSetup) {
        Notify.create({ message: 'Es necesario iniciar sesión', position: 'top' })
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    // Verificación de vencimiento del plan
    const { data } = await MostrarVencimento()
    const dueDate = parseISO(data.dueDate)
    const daysUntilDue = differenceInDays(dueDate, new Date())

    if (daysUntilDue < 0 && to.name !== 'financeiro') {
      Notify.create({ message: 'Su plan ha vencido. Por favor, renueve su plan.', position: 'top' })
      next({ name: 'financeiro' })
    } else {
      if (to.meta.requiresAuth) {
        const usuario = JSON.parse(localStorage.getItem('usuario'))
        if (usuario.profile === 'admin') {
          if (to.fullPath === '/empresas' && usuario.tenantId !== 1) {
            Notify.create({ message: 'Acceso no autorizado', position: 'top' })
            next({ name: 'home-dashboard' })
          }
          next()
        } else {
          Notify.create({ message: 'Acceso no autorizado', position: 'top' })
          next({ name: 'home-dashboard' })
        }
      } else {
        next()
      }
    }
  }
})

Router.afterEach(to => {
  window.scrollTo(0, 0)
})

export default Router
