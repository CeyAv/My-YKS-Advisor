# YKS-Advisor
Öğrencilerin YKS netlerini, hobilerini ve psikolojisini analiz ederek en uygun üniversite bölümlerini sunan yapay zeka destekli rehberlik asistanı.

## Problem:

Dünyada ve özellikle ülkemizde milyonlarca genç, hayatlarının en kritik döneminde (YKS), sadece akademik netlere ve puanlara indirgenmiş durumdalar. Bu "puan odaklı" sistem; öğrencinin tutkularını, hobilerini ve ruh halini tamamen görmezden gelmektedir. Sonuç: Yanlış seçilen bölümler, mutsuz üniversite yılları ve potansiyelini gerçekleştiremeyen kayıp bir nesil. Bu, bireysel bir sorundan ziyade toplumsal bir insan kaynağı israfıdır.

## Çözüm (Yapay Zeka Destekli Somut Çözüm):

YKS Advisor, bu kötücül döngüyü kırmak için geliştirilmiş, empati yeteneği olan bir yapay zeka asistanıdır. Öğrenciyi sadece bir "puan" olarak görmez; netlerini, karakterini, ilgi alanlarını ve anlık psikolojik durumunu bir bütün olarak analiz eder. 27.000'den fazla satırlık devasa bir üniversite veri setini Gemini 1.5 Pro'nun analiz gücüyle birleştirerek, öğrenciye sadece bir "tercih listesi" değil, bir "hayat vizyonu" sunar.

## Projenin Somut ve Çalışan Özellikleri:

*Çok Boyutlu Analiz:* Netler + Hobiler + Psikolojik Durum + Şehir Tercihi eşleşmesi.

*Büyük Veri Gücü:* 27.000+ gerçek üniversite verisi üzerinde anlık tarama.

*Empatik Rehberlik:* 20 yıllık bir rehber öğretmen şefkatiyle hazırlanan kişiselleştirilmiş tavsiyeler ve kaygı danışmanlığı.

## Canlı Demo: 
*Feedback page:* https://docs.google.com/forms/d/e/1FAIpQLScNMn82R3MV-gkWv38Wfal2okzVZQf6WgDy_R1b9y65vsV2jA/viewform?usp=publish-editor

*Yayın Linki:* https://yks-advisor-aibuildathon.netlify.app/

*Demo Video:* 

## Kullanılan Teknolojiler
Çekirdek Zeka (Core AI): Gemini 1.5 Pro (Google AI Studio üzerinden optimize edildi) – Rehberlik mantığının ve empatik yanıtların üretilmesi.

Kodlama ve IDE: VS Code AI & Cursor – Uygulamanın mimari yapısının kurulması ve "Vibe Coding" metodolojisiyle hızlı prototipleme.

Veri Mühendisliği: Julius AI & Perplexity – 27.000 satırlık ham üniversite verisinin analizi, temizlenmesi ve anlamlı "keyword" setlerine dönüştürülmesi.

Mantıksal Akış, Prompt Engineering: Claude 3.5 Sonnet & ChatGPT – Rehber öğretmen persona’sının kurgulanması ve karmaşık JavaScript fonksiyonlarının mantıksal denetimi.

Bilgi Yönetimi: NotebookLM – Üniversite tercih kılavuzları ve mevzuat bilgilerinin sentezlenerek projeye kaynaklık etmesi.

Yayınlama ve Otomasyon: Bolt.new & Netlify – Projenin bulut altyapısına taşınması ve canlıya alınması.

## Nasıl Çalıştırılır ve Kullanılır?

Uygulama tamamen bulut üzerinde (Netlify) yayındadır ve herhangi bir kurulum gerektirmez.

Aşağıda verilen "yayın Linki" başlığına basılır ve YKS Advisor Canlı Sitesi adresine gidilir.

Ana sayfadaki "Hadi Başlayalım" butonuna tıklayarak veri giriş formuna ulaşılır.

Netlerinizi, hedeflerinizi, hobilerinizi ve en önemlisi ruh halinizi girerek "Bana Rehberlik Et" butonuna basın.

Önemli Not: Sistem arka planda 27.000+ satırlık bir veri setini analiz ettiği için yanıt süresi 30 saniyeyi bulabilir. Eğer timeout hatası alırsanız butona tekrar basmanız yeterlidir.

Ardından, YKS Advisor her üniversite ve bölüm için sadece puan eşleştirmesi yapmaz; aşağıdaki 7 temel başlıkta derinlemesine analiz sunar:
1. Kurumsal Tanıtım: Üniversitenin köklü yapısı, eğitim felsefesi ve vizyonu.
2. Kampüs ve Teknik İmkanlar: * Lokasyon bilgisi (Örn: Topkapı, Cevizlibağ kampüsleri).
3. Laboratuvar altyapısı (Ar-Ge, Siber Güvenlik, Yapay Zeka laboratuvarları vb.).
4. Kütüphane ve dijital kaynak erişimi.
5. Akademik Detaylar: Bölümün eğitim dili, burs imkanları (Tam Burs, Başarı Bursu vb.) ve teknik ders içerikleri.
6. Sektörel Projeksiyon: * Mezuniyet sonrası iş olanakları ve unvanlar.
7. Sektörün güncel durumu ve gelecekteki talep tahmini.
8. Uluslararası çalışma fırsatları.
9. Kişiselleştirilmiş Net Analizi: * Mevcut netlerin taban puanla kıyaslanması.
10. "Yeterli/Yetersiz" durumunun dürüst ve empatik bildirimi.
11. Stratejik Eylem Planı: * Net artırmak için "Nokta Atışı" konu önerileri (Örn: "Isı ve Sıcaklık", "Problemler" gibi spesifik başlıklar).
12. Kısa vadeli çalışma taktikleri.
13. Psikolojik Rehberlik: Sınav kaygısı, motivasyon düşüklüğü ve toplumsal baskı (maaş kaygısı vb.) konularında "Rehber Öğretmen" perspektifiyle verilen yanıtlar.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

*Teknik Not ve Performans Bildirimi:*

Projem, gerçek zamanlı olarak 27.000 + satırlık dinamik bir veri setini analiz etmektedir. Gemini 1.5 Pro, bu devasa veriyi süzüp en empatik ve doğru rehberlik yanıtını oluştururken; yoğun veri işleme süreci nedeniyle bazen sunucu tarafındaki 30 saniyelik zaman aşımı limitlerine takılabilmektedir. Bu durum, veri yoğunluğundan kaynaklanan geçici bir durumdur ve tekrar denendiğinde düzelmektedir. Gelecek versiyonlarda Vektör Veritabanı ve Indexing optimizasyonları ile bu süreyi milisaniyelere indirmek öncelikli teknik hedefim olacaktır.
