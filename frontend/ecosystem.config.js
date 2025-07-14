module.exports = [{
  script: 'server.js',
  name: 'Whazing-frontend',
  exec_mode: 'fork',
  cron_restart: '00 00 * * *',
  instances: 1,
  watch: false
}]
