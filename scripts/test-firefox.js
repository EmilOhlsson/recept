const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testWithFirefox() {
  console.log('Starting Firefox test...');
  
  // Start Jekyll server in background
  const jekyllServer = spawn('bundle', ['exec', 'jekyll', 'serve', '--port', '4000'], {
    cwd: '/home/kotte/workspace/recept',
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Launch Firefox with console logging
  const firefox = spawn('firefox', [
    '--headless',
    '--new-instance',
    '--no-remote',
    '--devtools',
    'http://localhost:4000'
  ], {
    stdio: 'pipe'
  });
  
  let output = '';
  firefox.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  firefox.stderr.on('data', (data) => {
    output += data.toString();
  });
  
  // Wait for page to load and JavaScript to execute
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Kill processes
  firefox.kill();
  jekyllServer.kill();
  
  console.log('Firefox output:');
  console.log(output);
  
  // Save output to file
  fs.writeFileSync('/home/kotte/workspace/recept/firefox-output.txt', output);
  console.log('Output saved to firefox-output.txt');
}

testWithFirefox().catch(console.error);