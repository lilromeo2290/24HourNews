const http = require('http');
const { execSync } = require('child_process');

// Simple HTTP server that serves the standalone Next.js app
// and auto-restarts it if it crashes
const PORT = 3000;
const HOST = '0.0.0.0';

// Start standalone server as child process
let child = require('child_process').spawn(
  'node',
  ['server.js'],
  {
    cwd: '/home/z/my-project/.next/standalone',
    env: {
      ...process.env,
      HOSTNAME: HOST,
      PORT: PORT,
      DATABASE_URL: 'file:/home/z/my-project/db/custom.db',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  }
);

child.stdout.on('data', (d) => process.stdout.write(d));
child.stderr.on('data', (d) => process.stderr.write(d));

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}, restarting...`);
  setTimeout(startServer, 2000);
});

function startServer() {
  child = require('child_process').spawn(
    'node',
    ['server.js'],
    {
      cwd: '/home/z/my-project/.next/standalone',
      env: {
        ...process.env,
        HOSTNAME: HOST,
        PORT: PORT,
        DATABASE_URL: 'file:/home/z/my-project/db/custom.db',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  child.stdout.on('data', (d) => process.stdout.write(d));
  child.stderr.on('data', (d) => process.stderr.write(d));
  child.on('exit', (code) => {
    console.log(`Server exited with code ${code}, restarting...`);
    setTimeout(startServer, 2000);
  });
}

console.log('Wrapper started, waiting for Next.js server...');