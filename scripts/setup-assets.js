const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../KAI/02_APP_UI_UX/assets/app-icon/KAI_AppIcon_Forest_1024.png');
const destDir = path.join(__dirname, '../assets');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, path.join(destDir, 'icon.png'));
  fs.copyFileSync(src, path.join(destDir, 'splash.png'));
  fs.copyFileSync(src, path.join(destDir, 'adaptive-icon.png'));
  fs.copyFileSync(src, path.join(destDir, 'favicon.png'));
  console.log('✅ Assets copied to ./assets/ with clean lowercase filenames!');
} else {
  console.log('⚠️ Source asset not found at:', src);
}
