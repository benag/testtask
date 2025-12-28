#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Refreshing translations...');

// Kill existing server
exec('pkill -f "node dist/server.js"', (error) => {
  if (error) {
    console.log('No existing server to kill');
  }
  
  // Rebuild frontend
  console.log('🏗️  Rebuilding frontend...');
  exec('cd client && npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      return;
    }
    
    console.log('✅ Frontend rebuilt successfully');
    
    // Start server
    console.log('🚀 Starting server...');
    const server = exec('npm start', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Server start failed:', error);
        return;
      }
    });
    
    // Show server output
    server.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    console.log('✅ Translation refresh complete!');
    console.log('🌐 Server should be running at http://localhost:3000');
    console.log('💡 Hard refresh your browser (Ctrl+Shift+R) to see changes');
  });
});
