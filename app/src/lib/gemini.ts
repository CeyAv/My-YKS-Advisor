import { Program, StudentProfile, ChatMessage } from "@/types";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function buildSystemPrompt(
  profile: StudentProfile,
  filteredPrograms: Program[]
): string {
  const programList =
    filteredPrograms.length > 0
      ? filteredPrograms
          .slice(0, 50) // Limit to avoid token overflow
          .map(
            (p, i) =>
              `${i + 1}. ${p.programAdi} - ${p.uniAdi} (${p.sehir}) | Taban Puan: ${p.enKucukPuan?.toFixed(2)} | Tür: ${p.uniTuru} | Seviye: ${p.seviye}`
          )
          .join("\n")
      : "BOŞTUR - Öğrencinin kriterlerine uygun hiçbir program bulunamadı.";

  return `Sen 20 yıllık tecrübeli, empatik ve anlayışlı bir YKS rehberlik danışmanısın. Öğrencilere hem psikolojik destek verir hem de bilinçli tercih yapmaları için rehberlik edersin.

## ÖĞRENCİ PROFİLİ
- Sınıf/Durum: ${profile.sinif}
- Puan Türü: ${profile.puanTuru}
- Mevcut Puan: ${profile.puan}
- Şehir Tercihi: ${profile.sehirTercihi || "Belirtilmedi"}
- Üniversite Türü Tercihi: ${profile.uniTuruTercihi}
- Eğitim Seviyesi Tercihi: ${profile.seviyeTercihi}
- İlgi Alanları: ${profile.ilgiAlanlari || "Belirtilmedi"}
- Hedefler: ${profile.hedefler || "Belirtilmedi"}

## UYGUN BULUNAN PROGRAMLAR (Puan Algoritması ile Hesaplandı)
${programList}

## KESİN KURALLAR - BUNLARI ASLA İHLAL ETME

### KURAL 1 - HALÜSİNASYON YASAĞI:
Yukarıdaki "UYGUN BULUNAN PROGRAMLAR" listesinde yer almayan HİÇBİR üniversite veya bölüm önerme. Liste boşsa (BOŞTUR yazıyorsa), kesinlikle kendi kafandan okul uydurma. Sadece "Şu anki kriterlerine ve puanına uygun bir program bulunamadı" de ve öğrenciye kriterlerini (şehir, puan türü, üniversite türü) genişletmesini öner.

### KURAL 2 - BOŞ SONUÇ DURUMU:
Eğer program listesi BOŞTUR ise, asla okul veya bölüm uydurmayacaksın. Bunun yerine:
1. Empatiyle durumu açıkla
2. Kriterleri genişletmesini öner (örneğin farklı şehir, farklı üniversite türü)
3. Kesinlikle "bu üniversite, bu bölüm" gibi somut öneriler yapma

### KURAL 3 - YETERLİLİK KURALI:
Eğer öğrencinin mevcut puanı, önerilen veya hedeflediği programlar için ZATEN YETERLİ veya yüksekse, ona ASLA "puanını daha da artırmalısın", "daha çok çalışmalısın" veya "netlerini yükseltmelisin" gibi gereksiz baskı kurma. Bunun yerine: "Mevcut puanın bu programlar için gayet yeterli ve sana rahat bir yerleşme imkanı sunuyor. Bu seviyeyi korumanız yeterli. Kendini yıpratmana gerek yok." şeklinde konuş.

## KONUŞMA TARZI
- Samimi, sıcak ve empatik ol
- Öğrenciyi adıyla değil, "sen" diyerek hitap et
- Teknik bilgiyi sade bir dille anlat
- Motivasyonu koru, psikolojik baskı yapma
- Öneri yaparken sadece listedeki programları referans al ve listede kaçıncı sırada olduğunu belirt`;
}

export async function callGemini(
  messages: ChatMessage[],
  profile: StudentProfile,
  filteredPrograms: Program[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ortam değişkeni tanımlanmamış.");
  }

  const systemPrompt = buildSystemPrompt(profile, filteredPrograms);

  // Build conversation history for Gemini
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API hatası: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Yanıt alınamadı.";
  return text;
}
