import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const distDir = path.join(process.cwd(), 'dist');
const outputFile = path.join(process.cwd(), 'dist-pages.zip');

if (!fs.existsSync(distDir)) {
  console.error('[Error] dist directory does not exist! Please run "npm run build:client" first.');
  process.exit(1);
}

// Ensure 404.html exists for Cloudflare Pages SPA routing
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');
if (fs.existsSync(indexPath) && !fs.existsSync(notFoundPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('[Info] Created 404.html fallback for Cloudflare Pages SPA routing.');
}

// Create _routes.json for Cloudflare Pages
const routesJsonPath = path.join(distDir, '_routes.json');
const routesContent = {
  version: 1,
  include: ['/*'],
  exclude: ['/assets/*']
};
fs.writeFileSync(routesJsonPath, JSON.stringify(routesContent, null, 2), 'utf-8');
console.log('[Info] Created _routes.json configuration.');

// Create zip stream
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`\n======================================================`);
  console.log(`🎉 Cloudflare Pages 直接上传离线部署包已生成！`);
  console.log(`📦 文件路径: ${outputFile}`);
  console.log(`📊 包体大小: ${sizeMb} MB (${archive.pointer()} 字节)`);
  console.log(`🚀 部署使用方法:`);
  console.log(`   1. 打开 Cloudflare 控制台 -> Workers 和 Pages -> 创建 -> Pages`);
  console.log(`   2. 选择“上传资产 (Direct Upload)”`);
  console.log(`   3. 解压 dist-pages.zip 并拖拽其中的所有文件，或直接上传`);
  console.log(`   4. 即刻完成 0 秒全球上线，免除任何编译环境依赖！`);
  console.log(`======================================================\n`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
