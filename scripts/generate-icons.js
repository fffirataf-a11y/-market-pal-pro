/**
 * Icon Generation Script
 * 
 * Bu script, SVG icon'dan farklı boyutlarda PNG icon'lar oluşturur.
 * 
 * Gereksinimler:
 * - sharp: npm install sharp --save-dev
 * 
 * Kullanım:
 * npm run generate-icons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  { size: 512, name: 'icon-512x512.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

console.log('🎨 Icon Generation Script');
console.log('========================\n');

// Sharp kullanarak (önerilen)
try {
  const sharp = require('sharp');
  
  console.log('✅ Sharp bulundu, PNG icon\'lar oluşturuluyor...\n');
  
  sizes.forEach(async ({ size, name }) => {
    try {
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✅ ${name} (${size}x${size}) oluşturuldu`);
    } catch (error) {
      console.error(`❌ ${name} oluşturulamadı:`, error.message);
    }
  });
  
  console.log('\n✨ Tüm icon\'lar başarıyla oluşturuldu!');
  console.log('📁 Dosyalar public/ klasöründe');
  
} catch (error) {
  console.log('⚠️  Sharp bulunamadı. Alternatif yöntemler:\n');
  console.log('1. Sharp yükleyin: npm install sharp');
  console.log('2. Veya online tool kullanın: https://realfavicongenerator.net/');
  console.log('3. Veya ICON_GENERATION_GUIDE.md dosyasına bakın\n');
  
  console.log('📋 Oluşturulması gereken dosyalar:');
  sizes.forEach(({ size, name }) => {
    console.log(`   - ${name} (${size}x${size})`);
  });
}

