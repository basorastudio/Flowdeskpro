<template>
  <div class="flex justify-center" style="width: 100%;">
      <q-card class="dashboard-container-cards">
      <q-card-section class="dashboard-cards q-pa-md q-mb-sm">
        <div class="row justify-center ">
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Empresas registradas</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ quantidadeTenants }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-office-building" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                    <p class="my-card-text text-caption my-card-content">Empresas Activas</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ quantidadeTenantsActive }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-office-building-plus" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Empresas Inactivas</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ quantidadeTenants - quantidadeTenantsActive }}
                    </p>
                  </div>
                  <div class="col">
                    <q-icon name="mdi-office-building-remove" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Total de Usuarios</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ quantidadeUsuarios }}
                    </p>

                  </div>
                  <div class="col">
                    <q-icon name="mdi-account-multiple" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Total de Mensajes</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ mensagem }}
                    </p>

                  </div>
                  <div class="col">
                    <q-icon name="mdi-forum-outline" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              :class="{'bg-dark text-green' : $q.dark.isActive}"
              class="my-card full-height"

            >
              <q-card-section class="text-center">
                <p class="my-card-text text-caption my-card-content">Total de Conexión</p>
                <div class="row items-center">
                  <div class="col">
                    <p class="my-card-number my-card-content text-h4 text-bold text-center">
                      {{ whatsapp }}
                    </p>

                  </div>
                  <div class="col">
                    <q-icon name="mdi-whatsapp" size="xl" color="#2f2f2f" class="my-card-content" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { getQuantidadeTenants, getQuantidadeTenantsActive, getMesagem, getWhatsapp } from 'src/service/dashboardEmpresas'
import { getQuantidadeUsuarios } from 'src/service/user'

export default {
  data () {
    return {
      quantidadeTenants: 0,
      quantidadeUsuarios: 0,
      quantidadeTenantsActive: 0,
      mensagem: 0,
      whatsapp: 0
    }
  },
  mounted () {
    getQuantidadeTenants().then(quantidade => {
      this.quantidadeTenants = quantidade
    })
    getQuantidadeUsuarios().then(response => {
      this.quantidadeUsuarios = response.data.totalUsers
    }).catch(error => {
      console.error('Error Al obtener el número de usuarios:', error)
    })
    getQuantidadeTenantsActive().then(quantidade => {
      this.quantidadeTenantsActive = quantidade
    })
    getMesagem().then(quantidade => {
      this.mensagem = quantidade.count
    })
    getWhatsapp().then(quantidade => {
      this.whatsapp = quantidade
    }
    )
  }
}
</script>

<style scoped>
</style>
