const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Running next build...");
  const output = execSync('npx next build', { encoding: 'utf-8' });
  fs.writeFileSync('build_debug.log', output, 'utf8');
  console.log("Build successful, output written to build_debug.log");
} catch (error) {
  console.error("Build failed!");
  fs.writeFileSync('build_debug.log', error.stdout || error.message, 'utf8');
}
