# PRD: YKS Yapay Zeka Rehberlik Asistanı

## 1. Belgenin Amacı
Bu belge, YKS'ye hazırlanan öğrencilere kişiselleştirilmiş üniversite ve bölüm tavsiyeleri veren, onlara psikolojik destek sağlayan yapay zeka destekli web uygulamasının MVP (Minimum Viable Product) sürümünü tanımlar.

## 2. Kullanıcı Akışı
1. **Veri Girişi:** Öğrenci sol paneldeki forma OBP, TYT/AYT netleri, hobileri ve ruh halini girer.
2. **Sohbet Başlangıcı:** "Bana Rehberlik Et" butonuna basar. Sağ panelde 20 yıllık deneyimli rehber öğretmen karakterine bürünmüş Gemini AI, öğrenciyle empatik bir sohbet başlatır.
3. **Eşleşme Kartları:** Yapay zeka, sistemin bulduğu en uygun 5 bölümü "% Uyum Oranı" ile görsel "Card" bileşenleri olarak sunar.
4. **Kariyer Kazanımları:** Her bölüm kartının altında, o bölümün potansiyel iş fırsatları ve kariyer olanakları madde madde listelenir.

## 3. Temel Özellikler (MVP)
* **İlk Panel (Form):** Sayısal girdiler (OBP, Netler), metin girdileri (Hobiler, Ruh Hali), açılır menü (9. Sınıf/ 10. Sınıf/ 11. Sınıf/ 12. Sınıf/ Mezun).
* **Sol Panel (Chat UI):** WhatsApp tarzı, mesajların yukarı kaydığı sohbet ekranı. Modern, ferah, açık tema (light mode).
* **Sol Panel / Eşleşme Kartları:** Önerilerin düz metin yerine şık UI kartları şeklinde gösterimi.

## 4. Teknik Altyapı
* **Frontend:** HTML, CSS, JavaScript (Modern ve duyarlı tasarım).
* **Backend/AI:** Google Gemini API.
* **Veritabanı (Hibrit Yaklaşım):** Halüsinasyonu ve aşırı API maliyetini önlemek için karmaşık veritabanı kullanılmayacaktır. Uygulama içinde 15 örnek bölüm barındıran yerel bir `veri.json` dosyası tutulacaktır. Arama ve filtreleme JavaScript ile yerel olarak yapılacak, API sadece filtrelenmiş 3 sonucu yorumlamak ve kullanıcıyla konuşmak için kullanılacaktır.

## 5. Başarı Kriterleri ve Sınırlar
* Yapay zeka asla "kesin kazanırsın" veya "kazanamazsın" gibi kesin yargılarda bulunmayacaktır.
* Yapay zeka uydurma veri (halüsinasyon) üretmeyecek, sadece "master_data.json" içinden JavaScript'in seçip ona gönderdiği 5 bölüm üzerinden yorum yapacaktır.
