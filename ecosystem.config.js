module.exports = {
  apps: [
    {
      name: '24hournews',
      script: '.next/standalone/server.js',
      cwd: '/home/24hournews',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'file:/home/24hournews/db/custom.db',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/home/24hournews/logs/pm2-error.log',
      out_file: '/home/24hournews/logs/pm2-out.log',
      time: true,
    },
  ],
};