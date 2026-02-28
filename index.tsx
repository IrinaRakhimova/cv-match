const { execSync } = require('child_process');
const path = require('path');
const distPath = path.join(__dirname, 'dist', 'index.html');
try {
  require('fs').accessSync(distPath);
} catch {
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
}
require('./server.js');
