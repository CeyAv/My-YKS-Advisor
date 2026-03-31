# 📝 Proje Görev Listesi (Project Roadmap)

YKS Advisor projesinin geliştirme aşamaları ve teknik güvenliği için izlenen yol haritası.

---

## 🏗️ Faz 1: Temel İskelet ve Arayüz (UI)
- [x] `index.html`, `style.css` ve `app.js` dosyalarının temel yapısını oluşturuldu.
- [x] Başlangıç sayfasında kısa bir onboarding (tanıtım) ve veri giriş ekranı tasarlandı.
- [x] Sayfayı iki ana panele böl (Sol: AI Asistan / Sağ: Sonuç Ekranı) yapısı kuruldu.
- [x] Modern, genç ve dikkat dağıtmayan (Light Mode) tasarım dili uygulandı.
- [x] Yüklenme (Loading) ve "AI Yazıyor..." (Typing) animasyonları UI'a entegre edildi.

## 📊 Faz 2: Veri Mühendisliği ve Mimari
- [x] Perplexity ve Claude ile optimize edilmiş, 21.602 satırlık asıl `master_data.json` veri tabanı sisteme entegre edildi.

## 🧪 Faz 3: Gelişmiş Filtreleme Algoritması
- [x] Kullanıcının formdaki verilerini (Puan, Hobi, Ruh Hali, Şehir) yakalayan fonksiyonlar yazıldı.
- [x] Dinamik OBP ve net dönüştürme mantığı (TYT/AYT hesaplamaları) kuruldu.
- [x] `master_data.json` içinden en yüksek uyum skoruna sahip (Reach, Match, Safety) sonuçları filtreleyen algoritma geliştirildi.

## 🧠 Faz 4: Yapay Zeka (Gemini API) ve RAG Entegrasyonu
- [x] Google Gemini 1.5 Flash API bağlantısı kuruldu.
- [x] "20 yıllık empatik rehber öğretmen" sistem talimatı (System Prompt) öğrenci seviyesine göre dinamik hale getirildi.
- [x] **RAG Entegrasyonu:** Filtrelenen veriler prompt içine enjekte edilerek uydurma (hallucination) riski sıfırlandı.
- [x] Sohbet geçmişini (Chat History) hafızada tutacak state yönetimi tamamlandı.

## 🎨 Faz 5: Dinamik UI ve Kullanıcı Deneyimi
- [x] API'den gelen öneriler şık ve tıklanabilir HTML Kartlarına dönüştürüldü.
- [x] Kartlara tıklandığında, o bölüm hakkında derinlemesine analiz tetikleyen sistem kuruldu.
- [x] API sınırlarına karşı hata mesajı (Toast Notification) sistemi eklendi.

## 🔐 Faz 6: Güvenlik ve Canlıya Alma (Deployment)
- [x] **Güvenlik Katmanı:** Gemini API anahtarı istemci tarafı (client-side) kodundan çıkarıldı. 
- [x] **Serverless Mimari:** API anahtarı Netlify panelinde "Environment Variables" altına tanımlanarak güvenli hale getirildi.
- [x] Kodlar GitHub deposuna (Repository) pushlandı.
- [x] Proje Netlify üzerinden canlıya alındı.

## 📄 Faz 7: Dokümantasyon ve Final
- [x] `README.md` dosyası Mermaid.js mimari şeması ile zenginleştirildi.
- [x] `idea.md` (Proje Vizyonu) ve `tech-stack.md` (Teknoloji Yığını) dosyaları tamamlandı.
- [x] Demo videosu çekildi ve yayın linkleri eklendi.
- [ ] **Final:** Proje teslimini gerçekleştir! 🚀🏆
