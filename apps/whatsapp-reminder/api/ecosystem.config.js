module.exports = {
  apps: [
    {
      name: 'ingetin-api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        SERVICE_TYPE: 'API'
      }
    },
    {
      name: 'ingetin-worker',
      script: 'dist/worker.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        SERVICE_TYPE: 'WORKER'
      }
    }
  ]
};
