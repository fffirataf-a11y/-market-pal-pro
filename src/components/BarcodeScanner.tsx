import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScanner = ({ onBarcodeDetected }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Kamera başlatılıyor...');
  const hasDetected = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isActive = true;

    const startCamera = async () => {
      if (!videoRef.current || hasDetected.current) return;

      try {
        console.log('🎥 Starting camera...');
        setStatusMessage('Kamera erişimi isteniyor...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (!isActive) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsScanning(true);
          setStatusMessage('Barkodu kameraya gösterin...');
          console.log('✅ Camera started');

          // Barkod tarama başlat
          startBarcodeScanning();
        }

      } catch (err: any) {
        console.error('❌ Camera error:', err);
        
        if (err.name === 'NotAllowedError') {
          setError('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera bulunamadı.');
        } else {
          setError('Kamera başlatılamadı. Lütfen tekrar deneyin.');
        }
      }
    };

    const startBarcodeScanning = () => {
      // Her 2 saniyede bir fotoğraf çek ve Gemini'ye gönder
      intervalRef.current = setInterval(() => {
        if (hasDetected.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        captureAndAnalyze();
      }, 5000);
    };

    const captureAndAnalyze = async () => {
      if (!videoRef.current || !canvasRef.current || hasDetected.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Video boyutunu canvas'a aktar
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Video frame'ini canvas'a çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Canvas'ı base64 image'e çevir
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const base64Image = imageData.split(',')[1];

      console.log('📸 Captured frame, analyzing with Gemini...');
      setStatusMessage('Barkod aranıyor...');

      try {
        const apiKey = import.meta.env.VITE_GEMINI_BARCODE_API_KEY;
        
        if (!apiKey) {
          throw new Error('Gemini API key not found');
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: "Bu görüntüde bir barkod var mı? Varsa, barkod numarasını oku. SADECE barkod numarasını ver, başka bir şey yazma. Eğer barkod yoksa veya okunamazsa 'YOK' yaz."
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Image
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 100,
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        console.log('🤖 Gemini response:', resultText);

        if (resultText && resultText !== 'YOK' && resultText.length > 5) {
          // Sadece rakamları çıkar
          const barcode = resultText.replace(/\D/g, '');
          
          if (barcode.length >= 8) {
            console.log('✅ Barcode detected:', barcode);
            hasDetected.current = true;
            setStatusMessage('Barkod bulundu!');

            // Başarı sesi
            try {
              const audioContext = new AudioContext();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.value = 0.3;
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.1);
            } catch {}

            // Callback çağır
            onBarcodeDetected(barcode);

            // Kamerayı kapat
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
          } else {
            setStatusMessage('Barkod bulunamadı, tekrar deneniyor...');
          }
        } else {
          setStatusMessage('Barkodu net gösterin...');
        }

      } catch (err) {
        console.error('❌ Gemini API error:', err);
        setStatusMessage('Barkod aranıyor...');
      }
    };

    startCamera();

    // Cleanup
    return () => {
      console.log('🧹 Cleanup: Stopping camera...');
      isActive = false;
      hasDetected.current = false;
      setIsScanning(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onBarcodeDetected]);

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-destructive/10 border border-destructive rounded-lg">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg border-4 border-primary bg-black"
        style={{ maxHeight: '500px', objectFit: 'cover' }}
      />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative bg-transparent"
            style={{
              width: '80%',
              height: '40%',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary" />
            
            <div className="absolute inset-x-0 h-0.5 bg-primary animate-scan-line" />
          </div>
        </div>
      </div>

      {/* Status */}
      {isScanning && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 space-y-2">
          <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium text-center whitespace-nowrap shadow-lg">
            <Camera className="inline-block w-4 h-4 mr-2 animate-pulse" />
            {statusMessage}
          </div>
          <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs text-center">
            💡 Barkodu iyi ışıkta, net gösterin
          </div>
        </div>
      )}
    </div>
  );
};
