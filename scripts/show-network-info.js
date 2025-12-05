/**
 * Network IP Bilgisi Gösterici
 * 
 * Bu script, uygulamayı gerçek telefon ile test etmek için
 * network IP adresini gösterir.
 */

import os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 ve internal olmayan adresleri al
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
        });
      }
    }
  }
  
  return addresses;
}

const PORT = 8080;
const addresses = getLocalIP();

console.log('\n📱 Mobil Test Bilgileri');
console.log('======================\n');

if (addresses.length === 0) {
  console.log('❌ Network IP bulunamadı');
  console.log('💡 WiFi veya Ethernet bağlantınızı kontrol edin\n');
} else {
  console.log('✅ Telefonunuzdan bu adresleri kullanabilirsiniz:\n');
  
  addresses.forEach(({ interface: name, address }) => {
    console.log(`   📡 ${name}:`);
    console.log(`      http://${address}:${PORT}`);
    console.log('');
  });
  
  // En yaygın kullanılan IP'yi vurgula
  const primaryIP = addresses[0].address;
  console.log('🎯 Önerilen adres:');
  console.log(`   http://${primaryIP}:${PORT}\n`);
  
  console.log('📋 Adımlar:');
  console.log('   1. Telefonunuz ve bilgisayarınız aynı WiFi ağında olmalı');
  console.log('   2. npm run dev komutunu çalıştırın');
  console.log('   3. Telefonunuzdan yukarıdaki adresi açın');
  console.log('   4. "Add to Home Screen" ile PWA olarak yükleyin\n');
}

