const fs = require('fs');
const path = require('path');

const mapping = {
  'admin': 'domains/admin',
  'apprentice': 'domains/apprentice',
  'community': 'domains/community',
  'dashboard': 'domains/dashboard',
  'faq': 'domains/faq',
  'mentor': 'domains/mentor',
  'mentor-profile': 'domains/mentor-profile',
  'messaging': 'domains/messaging',
  'my-workshops': 'domains/my-workshops',
  'network': 'domains/network',
  'profil': 'domains/profil',
  'settings': 'domains/settings',
  'user': 'domains/user',
  'workshop': 'domains/workshop',
  'workshop-editor': 'domains/workshop-editor',
  'sign-in-form': 'domains/auth/sign-in-form',
  'sign-up-form': 'domains/auth/sign-up-form',
  'layout': 'shared/layout',
  'back-button': 'shared/back-button',
  'footer': 'shared/footer',
  'header': 'shared/header',
  'loader': 'shared/loader',
  'mode-toggle': 'shared/mode-toggle',
  'notification-bell': 'shared/notification-bell',
  'providers': 'shared/providers',
  'scroll-to-top-button': 'shared/scroll-to-top-button',
  'sidebar': 'shared/sidebar',
  'theme-provider': 'shared/theme-provider',
  'user-menu': 'shared/user-menu',
  'ui': 'ui' // Added ui to handle relative imports to ui
};

const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

function updateImports(content, isInsideComponents) {
  let newContent = content;

  // 1. Replace absolute imports: "@/components/OLD"
  for (const key of sortedKeys) {
    const target = mapping[key];
    const regex = new RegExp(String.raw`(@\/components\/)${key}([\/"'])`, 'g');
    newContent = newContent.replace(regex, `$1${target}$2`);
  }

  // 2. Replace relative imports if inside app/src/components
  if (isInsideComponents) {
    for (const key of sortedKeys) {
      const target = mapping[key];
      // Match from "./key" or from "../key"
      // We use a group for the relative prefix (./ or ../)
      const regex = new RegExp(String.raw`(from\s+["'])(\.\.?\/)${key}([\/"'])`, 'g');
      // We replace the relative path with the absolute path
      newContent = newContent.replace(regex, `$1@/components/${target}$3`);
    }
  }

  return newContent;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.resolve(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const isInsideComponents = filePath.startsWith(componentsDir);
    const updatedContent = updateImports(content, isInsideComponents);
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});
