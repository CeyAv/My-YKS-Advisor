# YKS Advisor — Kişiselleştirilmiş Üniversite Rehberliği

YKS puanınıza ve ilgi alanlarınıza göre yapay zeka destekli, kişiselleştirilmiş üniversite ve bölüm önerileri.

## Özellikler

- **Gerçek Veri**: YÖK 2025 taban/tavan puan verileri (21.600+ program)
- **Puan Bazlı Filtreleme**: TYT / EA / SAY / SÖZ / DİL puan türlerine göre anlık filtreleme
- **Empatik AI Danışman**: Gemini API ile 20 yıllık deneyimli rehber öğretmen simülasyonu
- **Halüsinasyon Önleme**: LLM yalnızca filtrelenmiş listeden öneri yapar, asla okul uydurmaz
- **Her Zaman Görünür Panel**: Sağ panel boş sonuçta da kaybolmaz, uygun bir mesaj gösterir

## Başlarken

### 1. Gereksinimler

- Node.js 18+
- [Google Gemini API anahtarı](https://aistudio.google.com/app/apikey)

### 2. Kurulum

```bash
cd app
npm install
cp .env.local.example .env.local
# .env.local dosyasına Gemini API anahtarınızı ekleyin
npm run dev
```

### 3. Ortam Değişkenleri

`.env.local` dosyasında:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Mimari

```
app/
  src/
    app/
      api/
        filter/route.ts   # Puan bazlı filtreleme API'si
        chat/route.ts     # Gemini API entegrasyonu
      page.tsx            # Ana sayfa (form + chat + panel)
    components/
      StudentForm.tsx     # Öğrenci profil formu
      ChatInterface.tsx   # Sohbet arayüzü
      UniversityPanel.tsx # Tercih listesi paneli (her zaman görünür)
    lib/
      filter.ts           # Filtreleme algoritması
      gemini.ts           # Gemini API istemcisi + sistem prompt
    data/
      programs.json       # YKS 2025 verileri (önlisans + lisans)
    types/
      index.ts            # TypeScript tipleri
```

## LLM Kuralları

Sistem prompt 3 katı kural içerir:

1. **Halüsinasyon Yasağı**: LLM yalnızca filtrelenmiş programları önerebilir, liste boşsa okul uyduramaz
2. **Boş Durum**: Liste boşsa empatiyle açıklar ve kriterleri genişletmeyi önerir
3. **Yeterlilik Kuralı**: Öğrenci puanı zaten yeterliyse, "daha çok çalış" baskısı yapmaz
