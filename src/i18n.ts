import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

// Desteklenen diller
const supportedLanguages = ['en', 'tr'];

// Telefon dilini algıla ve desteklenen dillerden biri mi kontrol et
const detectLanguage = (): string => {
  // Önce localStorage'dan kontrol et (kullanıcı manuel değiştirmişse)
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  // Telefon dilini algıla
  const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';

  // Tam dil kodu (örn: 'tr-TR') veya sadece dil kodu (örn: 'tr')
  const languageCode = browserLanguage.split('-')[0].toLowerCase();

  // Desteklenen dillerden biri mi kontrol et
  if (supportedLanguages.includes(languageCode)) {
    return languageCode;
  }

  // Desteklenmiyorsa İngilizce kullan
  return 'en';
};

// İlk açılışta dil algılama (localStorage'da yoksa)
const initialLanguage = detectLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      // localStorage'ı öncelikli olarak kontrol et
      order: ['localStorage', 'navigator'],
      // localStorage key'i
      lookupLocalStorage: 'language',
      // Cache yapma, her seferinde kontrol et
      caches: [],
      // Özel dil algılama fonksiyonu
      convertDetectedLanguage: (lng: string) => {
        // Tam dil kodu (örn: 'tr-TR') veya sadece dil kodu (örn: 'tr')
        const languageCode = lng.split('-')[0].toLowerCase();

        // Desteklenen dillerden biri mi kontrol et
        if (supportedLanguages.includes(languageCode)) {
          return languageCode;
        }

        // Desteklenmiyorsa İngilizce kullan
        return 'en';
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

// İlk açılışta algılanan dili localStorage'a kaydet (eğer kayıtlı değilse)
if (!localStorage.getItem('language')) {
  localStorage.setItem('language', initialLanguage);
}

export default i18n;