# Kullanılan Teknolojiler ve AI Araçları (Tech Stack)

Bu proje, modern web standartları ve çoklu yapay zeka (Multi-AI) ekosistemi kullanılarak uçtan uca bir ürün vizyonuyla geliştirilmiştir.

## Yapay Zeka Ekosistemi
Projenin hem geliştirme hem de çalışma aşamasında alanının en iyi yapay zeka araçları entegre bir şekilde kullanılmıştır:

- **Google Gemini API (Core Engine):** Uygulamanın beyni. Doğal dil işleme yeteneği, hızlı yanıt süresi ve öğrencilerle empati kurabilen metinler üretebilmesi sebebiyle asıl tavsiye motoru olarak kullanılmıştır.
- **Claude AI (Development Assistant):** Kodlama sürecinde, algoritma mantığının kurulmasında, hata ayıklama (debugging) işlemlerinde ve temiz kod (clean code) pratiklerinin uygulanmasında asistan olarak kullanılmıştır.
- **Perplexity AI (Research & Validation):** Proje fikrinin özgünlüğünü doğrulamak, YKS alanındaki mevcut uygulamaları taramak ve kapsamlı bir pazar/literatür araştırması yapmak için kullanılmıştır.

## 💻 Frontend (Arayüz)
- **HTML5, CSS3, Vanilla JavaScript:** Uygulamanın hafif, hızlı çalışması ve ekstra kütüphane bağımlılığı (overhead) yaratmaması için modern standartlarla sıfırdan yazılmıştır.

## 🛠️ Geliştirme ve Dağıtım Ortamı
- **Geliştirme:** Cursor / VS Code (Yapay zeka destekli kodlama imkanı sunduğu için).
- **Versiyon Kontrolü:** Git & GitHub (Kodun güvenli bir şekilde saklanması ve sürekli entegrasyona hazır olması için).
- **Hosting / Dağıtım (Deployment):** Vercel AI (GitHub ile doğrudan entegre çalışarak kod değişikliklerini anında CI/CD pipeline'ı ile canlıya alabildiği için tercih edilmiştir).

**Güvenlik Notu:** Uygulamada kullanılan Gemini API anahtarı, güvenlik standartları gereği kaynak kodun içinde (`.js` dosyasında) açıkça bırakılmadı; `Environment Variables` (Çevre Değişkenleri) kullanılarak sunucu tarafında (Netlify üzerinde) gizlenmiştir.

## 📊 Veri Mühendisliği ve Çoklu-AI İşlem Hattı (Multi-AI Data Pipeline)
Sistemi sadece bir API'ye bağlayıp bırakmak yerine, yanıt hızını ve kalitesini maksimize etmek için arka planda **3 farklı yapay zeka modelinin** bir arada çalıştığı bir veri hazırlık süreci (Data Pipeline) kurgulanmıştır:

1. **Veri Toplama ve Literatür Taraması (Perplexity AI):** "YKS öğrenci psikolojisi", "Rehberlik vaka örnekleri" ve "Bölüm seçimi istatistikleri" gibi konularda Perplexity kullanılarak derinlemesine web araştırması yapılmış ve dağınık veriler (makaleler, forum girdileri, YÖK verileri) toplanmıştır.
2. **Veri Sentezi ve Analiz (Google NotebookLM):** Toplanan tüm bu ham metinler ve PDF'ler Google NotebookLM'e yüklenerek projeye özel bir "kaynakça" oluşturulmuştur. NotebookLM'in RAG (Gelişmiş Kaynak Okuma) teknolojisi kullanılarak, bu belgelerin içinden öğrenci profilleri, kaygı nedenleri ve motivasyonel anahtar kelimeler süzülmüştür.
3. **JSON Veri Tabanı İnşası (Claude 3.5 Sonnet):** NotebookLM'den elde edilen bu rafine ve yapılandırılmış notlar Claude'a verilmiş ve uygulamanın anında okuyabileceği `master_data.json` isimli statik bir veri tabanına dönüştürülmesi sağlanmıştır.
4. **Sistem Çıktısı (Google Gemini API):** Son aşamada, hazırlanan bu kusursuz veri tabanı uygulamanın içine gömülmüş ve canlı sistemdeki Gemini API'nin "Prompt" motorunu besleyecek yakıt haline getirilmiştir.
