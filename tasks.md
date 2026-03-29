# Proje Görev Listesi (tasks.md)

## Faz 1: Temel İskelet ve Arayüz (UI)
- [x] `index.html`, `style.css` ve `app.js` dosyalarını oluştur.
- [x] Başlangıç sayfasında ufak bir tanıtıma yer ver ardından veri giriş ekranını aç.
- [x] Sayfayı iki ana panele böl (Sol: AI asistan, Sağ: Sonuç Ekranı).
- [x] Modern, genç ve dikkat dağıtmayan (Light mode) bir tasarım uygula.
- [x] Yüklenme (Loading) durumları ve "Yazıyor..." (Typing) animasyonlarını UI'a ekle.

## Faz 2: Veri Mühendisliği ve Mimari
- [x] İçinde 15 adet örnek üniversite/bölüm barındıran geçici `veri.json` dosyasını oluştur (Prototip aşaması).
- [x] **[GÜNCELLEME]** Geçici veri seti yerine, yapay zeka araçları (Perplexity, NotebookLM, Claude) kullanılarak optimize edilmiş asıl `master_data.json` veri tabanını sisteme entegre et.

## Faz 3: Gelişmiş Filtreleme Algoritması
- [x] Kullanıcının formdaki verilerini (Puan, Hobi, Ruh Hali, Şehir) okuyacak fonksiyonu yaz.
- [x] Dinamik OBP ve net dönüştürme mantığını kur (TYT/AYT hesaplamaları).
- [x] `master_data.json` içinden en yüksek uyum skoruna sahip (Reach, Match, Safety mantığıyla) top 5/20 sonucu filtreleyen algoritmayı yaz.

## Faz 4: Yapay Zeka (Gemini API) ve RAG Entegrasyonu
- [x] JavaScript içine Google Gemini API bağlantısını kur.
- [x] "20 yıllık empatik rehber öğretmen" sistem talimatını (System Prompt) öğrenci seviyesine (9. sınıf vs. 12. sınıf) göre dinamik hale getir.
- [x] Hallucination (Uydurma) riskini sıfıra indirmek için, filtrelenen sonuçları RAG mantığıyla Prompt'un içine enjekte et.
- [x] Sohbet geçmişini (Chat History) hafızada tutacak state yönetimini kur.

## Faz 5: Dinamik UI ve Kullanıcı Deneyimi
- [x] API'nin önerdiği bölümleri yakalayarak bunları şık ve tıklanabilir HTML Kartlarına (Card Component) dönüştür.
- [x] Kartlara tıklandığında, o üniversite/bölüm hakkında yapay zekadan derinlemesine detay isteyen tetikleyicileri (Event Listeners) ekle.
- [x] API istek sınırlarına (Rate Limit) karşı bekleme süresi (Cooldown) ve hata mesajı (Toast Notification) sistemini kur.

## Faz 6: Güvenlik ve Canlıya Alma (Deployment)
- [x] Gemini API anahtarını kodun içinden çıkar ve güvenli bir şekilde `Environment Variables` (.env) arkasına gizle.
- [x] Kodları GitHub deposuna (Repository) pushla.
- [x] Projeyi GitHub entegrasyonu ile (Örn: Netlify.dev / Loveable vb.) canlı bir sunucuya (Deployment) al.

## Faz 7: Dokümantasyon ve Teslimat
- [x] `README.md` dosyasını proje detayları ve Mermaid.js mimari şeması ile doldur.
- [x] `idea.md` (Proje fikri) ve `tech-stack.md` (Kullanılan AI araçları ve teknolojiler) dosyalarını oluştur.
- [x] Sistemin nasıl çalıştığını anlatan Demo Videosunu çek ve linkini ekle.
- [ ] **Proje Teslimini Gerçekleştir! 🚀🏆**