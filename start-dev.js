const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🚀 Starting FindIt AI – Smart Lost & Found Matcher');
console.log('========================================================\n');

// Start Express Backend Server
const serverProcess = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Start Vite React Client
const clientProcess = spawn('node', ['client/node_modules/vite/bin/vite.js'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n[Dev] Shutting down FindIt AI processes...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
