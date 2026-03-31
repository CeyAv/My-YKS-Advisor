# 🗺️ Kullanıcı Akışı (User Flow)

YKS Advisor, kullanıcının bilişsel ve duygusal verilerini harmanlayan akıcı bir deneyim sunar.

### 📊 Süreç Diyagramı
```mermaid
graph TD
    A[Giriş: Karşılama Ekranı] --> B{Veri Girişi}
    B -->|Bölüm/Hedef| C[Akademik Parametreler]
    B -->|Ruh Hali/Durum| D[Duygusal Parametreler]
    C & D --> E[Tavsiye Al Butonu]
    E --> F[Prompt Yapılandırma & Gemini API]
    F --> G[Animasyonlu Sonuç Ekranı]
    G --> H{İterasyon}
    H -->|Yeni Deneyim| B
    H -->|Çıkış| I[Son]
