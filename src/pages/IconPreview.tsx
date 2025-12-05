import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IconPreview = () => {
  const navigate = useNavigate();

  // Icon dosyalarını kontrol et
  const iconSizes = [
    { size: 512, name: 'icon-512x512.png', label: '512x512 (PWA Large)' },
    { size: 192, name: 'icon-192x192.png', label: '192x192 (PWA Standard)' },
    { size: 180, name: 'apple-touch-icon.png', label: '180x180 (iOS)' },
    { size: 32, name: 'favicon-32x32.png', label: '32x32 (Favicon)' },
    { size: 16, name: 'favicon-16x16.png', label: '16x16 (Small Favicon)' },
  ];

  const backgrounds = [
    { name: 'Beyaz (Light Mode)', color: '#ffffff', textColor: '#000000' },
    { name: 'Siyah (Dark Mode)', color: '#000000', textColor: '#ffffff' },
    { name: 'Gri (System)', color: '#808080', textColor: '#ffffff' },
    { name: 'Mavi (Brand)', color: '#3b82f6', textColor: '#ffffff' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground mb-4"
          >
            ← Geri
          </button>
          <h1 className="text-4xl font-bold">App Icon Önizleme</h1>
          <p className="text-muted-foreground">
            Ana ekranda icon'unuzun nasıl görüneceğini kontrol edin
          </p>
        </div>

        {/* SVG Icon Preview */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">SVG Icon (Mevcut)</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {backgrounds.map((bg) => (
              <div key={bg.name} className="text-center space-y-3">
                <div
                  className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: bg.color }}
                >
                  <img
                    src="/icon.svg?v=5"
                    alt="App Icon"
                    className="w-24 h-24"
                    key={`icon-${bg.name}`}
                  />
                </div>
                <p className="text-sm font-medium" style={{ color: bg.textColor }}>
                  {bg.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Phone Home Screen Simulation */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Telefon Ana Ekranı Simülasyonu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* iOS Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">iOS Stili (Beyaz Arka Plan)</h3>
              <div className="bg-white rounded-3xl p-6 shadow-xl" style={{ minHeight: '400px' }}>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <img
                          src="/icon.svg?v=5"
                          alt="App Icon"
                          className="w-12 h-12"
                        />
                      </div>
                      <span className="text-xs text-gray-600 text-center">SmartMarket</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Android Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Android Stili (Koyu Arka Plan)</h3>
              <div className="bg-gray-900 rounded-3xl p-6 shadow-xl" style={{ minHeight: '400px' }}>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <img
                          src="/icon.svg?v=5"
                          alt="App Icon"
                          className="w-12 h-12"
                        />
                      </div>
                      <span className="text-xs text-gray-300 text-center">SmartMarket</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PNG Icons Status */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">PNG Icon Durumu</h2>
          <div className="space-y-4">
            {iconSizes.map((icon) => {
              const IconStatus = () => {
                const [exists, setExists] = useState<boolean | null>(null);
                
                useEffect(() => {
                  // Icon'un var olup olmadığını kontrol et
                  const img = new Image();
                  img.onload = () => setExists(true);
                  img.onerror = () => setExists(false);
                  img.src = `/${icon.name}`;
                }, [icon.name]);
              
                return (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center relative">
                        {exists === true ? (
                          <img
                            src={`/${icon.name}`}
                            alt={icon.label}
                            className="w-8 h-8"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{icon.label}</p>
                        <p className="text-sm text-muted-foreground">{icon.name}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      {exists === true ? (
                        <span className="text-green-600">✅ Mevcut</span>
                      ) : exists === false ? (
                        <span className="text-orange-600">⚠️ Oluşturulmalı</span>
                      ) : (
                        <span className="text-muted-foreground">⏳ Kontrol ediliyor...</span>
                      )}
                    </div>
                  </div>
                );
              };
              
              return <IconStatus key={icon.name} />;
            })}
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Not:</strong> PNG icon'ları oluşturmak için: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">npm run generate-icons</code>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Etme Talimatları</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Telefonunuzdan <code className="bg-muted px-2 py-1 rounded">http://192.168.1.13:8080</code> adresini açın</li>
            <li>Tarayıcıda "Add to Home Screen" seçeneğini kullanın</li>
            <li>Ana ekranda icon'unuzu kontrol edin</li>
            <li>Farklı arka plan renklerinde nasıl göründüğünü test edin</li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-100 font-semibold mb-2">
              ⚠️ Eski Icon Görünüyorsa (Cache Sorunu):
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              <li>Tarayıcı cache'ini temizleyin: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">Ctrl+Shift+Delete</code> (Windows) veya <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">Cmd+Shift+Delete</code> (Mac)</li>
              <li>Hard refresh yapın: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">Ctrl+F5</code> (Windows) veya <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">Cmd+Shift+R</code> (Mac)</li>
              <li>Telefonda: Tarayıcı ayarlarından "Clear Cache" yapın</li>
              <li>PWA'yı kaldırıp tekrar ekleyin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPreview;

