# Kullanıcı Akışı (User Flow)

1. **Karşılama**: Kullanıcı web sitesine girer ve temiz, dikkat dağıtmayan bir arayüzle karşılaşır.
2. **Veri Girişi (Input):**
   - Kullanıcı hedeflediği bölümü yazar (veya boş bırakır/bilmiyorum der).
   - Açılır menüden o anki ruh halini seçer (Motivasyonlu, Stresli, Kararsız vb.).
   - Mevcut eğitim durumunu seçer (12. Sınıf, Mezun vb.).
3. **İşlem (Processing):** Kullanıcı "Tavsiye Al" butonuna tıklar.
4. **AI Entegrasyonu:** Sistem, kullanıcının girdiği bu verileri alır, arka planda yapılandırılmış bir "Prompt" (Komut) haline getirir ve güvenli bir şekilde Gemini API'sine iletir.
5. **Sonuç (Output):** Gemini'den gelen kişiselleştirilmiş tavsiye, arayüzde animasyonlu ve şık bir metin kutusu içerisinde kullanıcıya sunulur.
6. **İterasyon:** Kullanıcı dilerse farklı parametreler seçerek yeni tavsiyeler alabilir.
