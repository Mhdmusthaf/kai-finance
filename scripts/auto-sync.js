const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
console.log('🔄 KAI Auto-Git Sync active! Watching project files...');

let syncTimeout = null;

const runGitSync = (filePath) => {
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(() => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n[${timestamp}] 📝 Change detected in: ${filePath || 'files'}`);
      console.log('🚀 Staging, committing, and pushing to GitHub...');
      
      execSync('git add .', { cwd: rootDir, stdio: 'inherit' });
      execSync(`git commit -m "auto-save: updated code at ${timestamp}"`, { cwd: rootDir, stdio: 'inherit' });
      execSync('git push origin main', { cwd: rootDir, stdio: 'inherit' });
      
      console.log('✅ Real-time sync complete! Live on GitHub.\n');
    } catch (error) {
      // If there are no modified tracked files to commit, ignore cleanly
    }
  }, 3000); // Waits 3 seconds after you finish editing
};

// Watch src, app, and root configuration files
['src', 'app'].forEach((folder) => {
  const targetDir = path.join(rootDir, folder);
  if (fs.existsSync(targetDir)) {
    fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
        runGitSync(filename);
      }
    });
  }
});

console.log('✨ Watching src/ and app/ for changes. Any save will auto-push to GitHub in 3s.');
