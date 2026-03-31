# 📄 Product Requirements Document (PRD)
## 🎓 YKS Advisor: MVP Sürüm Tanımlama Belgesi

---

### [1] Belgenin Amacı
Bu belge, YKS hazırlık sürecindeki öğrencilere; akademik veriler (OBP, Net), ilgi alanları (Hobiler) ve duygusal durum (Mood) ekseninde kişiselleştirilmiş rehberlik sunan **AI-Native** web uygulamasının **MVP (Minimum Viable Product)** kapsamını tanımlar.

---

### [2] Kullanıcı Deneyimi ve Akışı (User Experience)

| Aşama | Aksiyon | Çıktı |
| :--- | :--- | :--- |
| **01. Veri Girişi** | Öğrenci; OBP, TYT/AYT netleri, hobileri ve ruh halini forma girer. | Ham verinin sisteme işlenmesi. |
| **02. Akıllı Eşleşme** | Algoritma, en uygun 5 bölümü **"% Uyum Oranı"** ile hesaplar. | Görsel "Match Cards" (Eşleşme Kartları). |
| **03. AI Aktivasyonu** | Kullanıcı "Bana Rehberlik Et" butonuna basarak diyalog başlatır. | Gemini AI ile empatik sohbetin başlaması. |
| **04. Vizyon Sunumu** | Kartların altında kariyer fırsatları ve gelecek projeksiyonu listelenir. | Somut kariyer yol haritası. |

---

### [3] Temel Özellik Seti (MVP Features)

* **[Form Paneli]:** Sayısal (Net/OBP) ve kategorik (Sınıf/Alan) girişlerin yanı sıra, "Mood" (Ruh Hali) seçimini içeren akıllı giriş arayüzü.
* **[Chat UI - Sol Panel]:** WhatsApp dinamiklerine sahip, mesajların akıcı şekilde kaydığı, "Light Mode" odaklı ferah sohbet ekranı.
* **[Discovery UI - Sağ Panel]:** Önerilen bölümlerin düz metin yerine, modern tasarım elementleri (Shadows, Border-radius) içeren şık kartlar şeklinde sunumu.

---

### [4] Teknik Mimari ve Strateji (Technical Stack)

> **"Maksimum Güven, Minimum Halüsinasyon"** prensibiyle kurgulanmıştır.

* **Frontend:** Modern HTML5, CSS3 (Flex/Grid) ve Vanilla JavaScript.
* **Zeka Katmanı:** Google Gemini 1.5 Flash API.
* **Hibrit Veri Yönetimi:** * **Data Integrity:** Halüsinasyonu ve API maliyetini önlemek için karmaşık bir DB yerine, uygulama içinde yapılandırılmış **master_data.json** (21.000+ satır) kullanılır.
    * **Filtreleme:** Arama ve eleme işlemleri JavaScript motoru ile yerel (local) olarak yapılır. 
    * **RAG (Retrieval-Augmented Generation):** API sadece seçilen sonuçları yorumlamak ve kullanıcıyla "Rehber Öğretmen" personasıyla konuşmak için kullanılır.

---

### [5] Başarı Kriterleri ve Etik Sınırlar (Guardrails)

* **Kesinlik Sınırı:** Yapay zeka asla "Kesin kazanırsın/kazanamazsın" gibi spekülatif yargılarda bulunmaz; olasılıklar ve stratejiler üzerinden konuşur.
* **Veri Sadakati:** AI, sadece sistemin kendisine gönderdiği gerçek veri seti üzerinden yorum yapar. Veri setinde olmayan bir üniversiteyi veya bölümü "uydurması" teknik olarak engellenmiştir.
* **Persona:** Yanıtlar her zaman "20 yıllık deneyimli bir rehber öğretmen" şefkatiyle ve çözüm odaklı bir tonlamayla verilir.

---

### [6] Gelecek Yol Haritası (Scalability)
* **V1.1:** Vector Database entegrasyonu ile anlık veri sorgulama hızı optimizasyonu.
* **V1.2:** Kullanıcıların tercih listelerini PDF olarak indirebilme özelliği.

---

**Bu belge, projenin sadece bir "sohbet botu" değil, veri odaklı bir "karar destek mekanizması" olduğunu ispatlar.**
