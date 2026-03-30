// UI iskeleti: Görev 1 kapsamında formdan sohbet başlatma akışını hazırlar.
// Sonraki görevlerde veri.json filtreleme ve Gemini API entegrasyonu eklenecek.

// Görev 4: Gemini API anahtarı (daha sonra kendi anahtarınla güncelleyeceksin)
const API_KEY = window.GEMINI_API_KEY || "GIZLI_ANAHTAR";
const API_COOLDOWN_MS = 60 * 1000;
const API_BUSY_MESSAGE = "Su an sistemde yogunluk var, lutfen 1 dakika bekleyip tekrar deneyin.";

const els = {
  landingPage: document.getElementById("landingPage"),
  landingStartBtn: document.getElementById("landingStartBtn"),
  dataEntryPage: document.getElementById("dataEntryPage"),
  resultsPage: document.getElementById("resultsPage"),

  sidePanel: document.getElementById("sidePanel"),
  mainPanel: document.getElementById("mainPanel"),
  backToFormBtn: document.getElementById("backToFormBtn"),
  profileForm: document.getElementById("profileForm"),
  startBtn: document.getElementById("startBtn"),

  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatSend: document.getElementById("chatSend"),

  chatMessages: document.getElementById("chatMessages"),
  resultsCardsContainer: document.getElementById("resultsCardsContainer"),
  statusPill: document.getElementById("statusPill"),
  nextMatchesBtn: document.getElementById("nextMatchesBtn"),
  // menuToggle: document.getElementById("menuToggle"),
  // dropdownMenu: document.getElementById("dropdownMenu"),,
};

const state = {
  isChatStarted: false,
  messages: [],
  allMatches: [],
  currentMatchStart: 0,
  studentProfile: null, // Öğrenci profili burada saklanacak
  isMenuOpen: false, // Menü açılıp kapanma durumu
  isLoading: false, // Loading state
  apiBlockedUntil: 0,
};

const SYSTEM_PROMPT =
  "Sen 20 yıllık şefkatli bir rehberlik hocasısın. İlk mesajında uzun uzun açıklama yapma. Empatik bir selamla başla ve sadece " +
  "önerdiğin 5 bölümün isimlerini ve ilgili üniversiteleri kısa bir liste olarak sun: 1) ... 5) ... " +
  "formatında. Sonra kullanıcıya 'Sağdaki menüden hakkında ayrıntılı bilgi almak istediğin üniversiteyi seçebilirsin.' diye ekle.";
const CHAT_SYSTEM_PROMPT =
  "Sen 20 yıllık şefkatli bir rehberlik hocasısın. Sohbet geçmişini dikkate al, öğrencinin önceki mesajlarını unutma, empatik bir dille kısa ve net yönlendirme yap. Kullanıcı bir üniversite/bölüm hakkında bilgi istediğinde şunları mutlaka açıkla: 1) Üniversitenin kampüs ve laboratuvar imkanları, 2) Mezuniyet sonrası iş olanakları ve sektör durumu, 3) Burs imkanları. En Önemlisi: Öğrencinin sana iletilen güncel TYT/AYT netleri, hedeflenen bölümün taban netlerinin altındaysa, aradaki farkı vurgula ve hangi derslere/konulara daha çok çalışması gerektiği konusunda stratejik, motive edici bir eylem planı sun. KURAL 4 (YETERLİ NET DURUMU): Eğer öğrencinin mevcut netleri (TYT veya AYT), hedeflediği bölüm/üniversite için zaten yeterli veya yüksekse, ona kesinlikle daha yüksek net hedefleri (ör. '90-100 yapmalısın', 'netlerini artırmalısın') verme. Bunun yerine şu tonda konuş: 'Mevcut netlerin bu bölüm için gayet yeterli ve sana rahat bir yerleşme imkanı sunuyor. Bu saatten sonra kendini yıpratmana gerek yok. Sadece bu seviyeni korumak için bol deneme çözebilirsin. Eğer kendini özel olarak geliştirmek istediğin, merak ettiğin bir ders veya konu varsa o alanda sana seve seve yardımcı olurum.'";

function getSystemPrompt(profile) {
  const sinif = profile.sinif;
  if (sinif === '9' || sinif === '10') {
    return "Sen 20 yıllık şefkatli bir rehberlik hocasısın. İlk mesajında uzun uzun açıklama yapma. Empatik bir selamla başla ve sadece önerdiğin 5 bölümün isimlerini ve ilgili üniversiteleri kısa bir liste olarak sun: 1) ... 5) ... formatında. Sonra da o bölüme girmek için yapması gereken netleri söyle ve kendini nasıl geliştirebileceği ile ilgili tavsiye ver. Henüz yolun başındasın, hedefin olan X üniversitesi çok güzel. Şu an yapman gereken en önemli şey okul derslerini (OBP) çok yüksek tutmak ve yavaş yavaş TYT paragraf/problem çözme alışkanlığı kazanmak. Önünde uzun ve rahat bir zaman var.";
  } else {
    return SYSTEM_PROMPT;
  }
}

function getChatSystemPrompt(profile) {
  const sinif = profile.sinif;
  if (sinif === '9' || sinif === '10') {
    return "Sen 20 yıllık şefkatli bir rehberlik hocasısın. Sohbet geçmişini dikkate al, öğrencinin önceki mesajlarını unutma, empatik bir dille kısa ve net yönlendirme yap. Kullanıcı bir üniversite/bölüm hakkında bilgi istediğinde şunları mutlaka açıkla: 1) Üniversitenin kampüs ve laboratuvar imkanları, 2) Mezuniyet sonrası iş olanakları ve sektör durumu, 3) Burs imkanları. Öğrencinin sana iletilen güncel TYT/AYT netleri, hedeflenen bölümün taban netlerinin altındaysa, aradaki farkı vurgula ve hangi derslere/konulara daha çok çalışması gerektiği konusunda stratejik, motive edici bir eylem planı sun. Öğrencinin sınıf seviyesini dikkate al: Henüz 9. veya 10. sınıf, teşvik edici ve motive edici ol.";
  } else {
    return CHAT_SYSTEM_PROMPT + " Öğrencinin sınıf seviyesini dikkate al: 11, 12. sınıf veya Mezun, detaylı, stratejik ve net odaklı yoğun çalışma analizini yap.";
  }
}

let localDataCache = null;

function setStatus(text, variant) {
  els.statusPill.textContent = text;
  els.statusPill.classList.remove(
    "bg-slate-100",
    "text-slate-600",
    "border-slate-300/50",
    "bg-green-100",
    "text-green-700",
    "border-green-300/50",
    "bg-red-100",
    "text-red-700",
    "border-red-300/50"
  );
  if (variant === "ok") {
    els.statusPill.classList.add("bg-green-100", "text-green-700", "border-green-300/50");
  } else if (variant === "error") {
    els.statusPill.classList.add("bg-red-100", "text-red-700", "border-red-300/50");
  } else {
    els.statusPill.classList.add("bg-slate-100", "text-slate-600", "border-slate-300/50");
  }
}

function showApiToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = [
    "fixed right-4 top-4 z-[9999] max-w-sm rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg",
    type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-emerald-50 text-emerald-800 border-emerald-200",
  ].join(" ");
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 5000);
}

function isApiCooldownActive() {
  return Date.now() < state.apiBlockedUntil;
}

function getCooldownSecondsLeft() {
  return Math.max(1, Math.ceil((state.apiBlockedUntil - Date.now()) / 1000));
}

function markApiRateLimited() {
  state.apiBlockedUntil = Date.now() + API_COOLDOWN_MS;
}

function createApiError(responseStatus, details = "") {
  if (responseStatus === 429) {
    markApiRateLimited();
    return new Error(API_BUSY_MESSAGE);
  }
  return new Error(`Gemini istegi basarisiz (${responseStatus}). ${details}`.trim());
}

function scrollChatToBottom() {
  els.chatMessages.scrollTo({
    top: els.chatMessages.scrollHeight,
    behavior: "smooth",
  });
}

function scrollToMessageStart(messageEl) {
  if (!messageEl) return;
  messageEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollPageToCards() {
  els.resultsCardsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMatchPage(startIndex = 0) {
  // Sayfa geçişini yönet
  if (els.landingPage) {
    els.landingPage.style.display = "none";
    els.landingPage.classList.add("hidden");
    els.landingPage.classList.remove("is-active");
  }
  if (els.dataEntryPage) {
    els.dataEntryPage.style.display = "none";
    els.dataEntryPage.classList.add("hidden");
    els.dataEntryPage.classList.remove("is-active");
  }
  if (els.resultsPage) {
    els.resultsPage.style.display = "flex";
    els.resultsPage.classList.remove("hidden");
    els.resultsPage.classList.add("is-active");
  }

  const allMatches = Array.isArray(state.allMatches) ? state.allMatches : [];
  state.currentMatchStart = Math.max(0, startIndex);
  const items = allMatches.slice(state.currentMatchStart, state.currentMatchStart + 5);
  if (items.length) {
    renderCards(items);
  } else {
    els.resultsCardsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-10 px-4 gap-4">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <p class="font-bold text-slate-800 text-sm mb-1">Uygun Bölüm Bulunamadı</p>
          <p class="text-xs text-slate-500 leading-relaxed">Girdiğin hobiler, puan ve şehir kriterlerine uyan bölüm yok. Farklı anahtar kelimeler veya şehir seçerek tekrar dene.</p>
        </div>
      </div>
    `;
  }

  if (els.nextMatchesBtn) {
    els.nextMatchesBtn.classList.toggle("is-visible", allMatches.length > 5);
  }

  setComposerEnabled(true);
  setStatus("Sonuçlar hazır. Sohbete devam edebilirsiniz.", "ok");
  scrollPageToCards();
}

function scrollPageToLatestChatMessage() {
  const lastMessage = els.chatMessages.lastElementChild;
  if (lastMessage) {
    lastMessage.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function cleanMarkdownText(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addMessage({ author, text }) {
  const wrap = document.createElement("div");
  wrap.className = author === "user" 
    ? "flex justify-end mb-4" 
    : "flex justify-start mb-4";

  const bubble = document.createElement("div");
  const safeText = author === "bot" ? cleanMarkdownText(text) : text;
  
  if (author === "user") {
    bubble.className = "max-w-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-tr-none p-4 shadow-md";
  } else {
    bubble.className = "max-w-md bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm text-slate-800";
  }
  
  bubble.textContent = safeText; // XSS korumalı
  wrap.appendChild(bubble);
  els.chatMessages.appendChild(wrap);
  scrollToMessageStart(wrap);

  state.messages.push({ author, text });
}

function addLoadingMessage() {
  const wrap = document.createElement("div");
  wrap.className = "flex justify-start mb-4";

  const bubble = document.createElement("div");
  bubble.className = "max-w-md bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm text-slate-600 text-sm";
  bubble.textContent = "Yükleniyor...";

  wrap.appendChild(bubble);
  els.chatMessages.appendChild(wrap);
  scrollChatToBottom();

  return bubble;
}

function addTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "flex justify-start mb-4";
  wrap.innerHTML = `
    <div class="max-w-md bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
      <span class="text-sm text-slate-600">Yazıyor</span>
      <span class="flex gap-1">
        <i class="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></i>
        <i class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></i>
        <i class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></i>
      </span>
    </div>
  `;
  els.chatMessages.appendChild(wrap);
  scrollChatToBottom();
  return wrap;
}

function setComposerEnabled(enabled) {
  els.chatInput.disabled = !enabled;
  els.chatSend.disabled = !enabled;
}

function toNumberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Gerçek zamanlı input kısıtlama: max aşıldığında anında düzelt
function clampInputMax(input) {
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  if (!isNaN(max) && !isNaN(val) && val > max) {
    input.value = max;
  }
}

// Alandan çıkıldığında min kısıtı uygula (yazarken engelleme yapma)
function clampInputMin(input) {
  const min = parseFloat(input.min);
  const val = parseFloat(input.value);
  if (!isNaN(min) && !isNaN(val) && val < min) {
    input.value = min;
  }
}

async function loadLocalVeri() {
  if (localDataCache) return localDataCache;

  const res = await fetch("./master_data.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`master_data.json yüklenemedi (${res.status}).`);
  const data = await res.json();
  localDataCache = Array.isArray(data) ? data : [];
  return localDataCache;
}

function estimateTYTPuan({ tytToplam, obp }) {
  // Basit/approx bir dönüşüm. (Görev 3 MVP; sonraki iterasyonda kalibre edilebilir.)
  // Not: `veri.json` en_kucuk/en_buyuk değerleri "puan" ölçeğindedir.
  return tytToplam * 7 + obp * 0.6;
}

function estimateAYTPuan({ aytToplam, obp }) {
  // Basit/approx bir dönüşüm.
  return aytToplam * 6 + obp * 0.6;
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value).split(" ").filter(Boolean);
}

const HOBBY_TO_PROGRAM_KEYWORDS = {
  yazilim: ["yazilim", "bilgisayar", "siber", "kod", "program", "otomasyon", "arka yuz"],
  teknoloji: ["teknoloji", "bilgisayar", "siber", "otomasyon", "biyomedikal", "grafik"],
  kodlama: ["yazilim", "program", "arka yuz", "bilgisayar", "siber"],
  insan: ["cocuk gelisimi", "yardim", "saglik", "turizm", "isletmecilik"],
  saglik: ["saglik", "tibbi", "laboratuvar", "biyomedikal", "ilk ve acil yardim"],
  yardim: ["ilk ve acil yardim", "saglik", "cocuk gelisimi", "laboratuvar"],
  yemek: ["ascilik", "gida", "otel", "turizm"],
  gezmek: ["turizm", "hava", "ulastirma", "otel"],
};

function extractHobbySignals(hobilerText, ruhHaliText = "") {
  const text = `${hobilerText || ""} ${ruhHaliText || ""}`;
  // Noktalama temizle, küçük harfe çevir, böl
  const cleaned = text.replace(/[.,!?;:]/g, '').toLowerCase();
  const words = cleaned.split(/\s+/).filter(Boolean);
  // Bağlaçları es geç
  const stopWords = ['ve', 'ile', 'gibi', 'veya', 'ama', 'fakat', 'ancak', 'çünkü', 'ki'];
  return words.filter(word => !stopWords.includes(word));
}

function computeKeywordMatchScore({ item, hobbySignals }) {
  if (!hobbySignals.length) return 0;

  const searchSpace = normalizeText(
    `${item.program_adi || ""} ${item.fakulte_myo_adi || ""} ${item.universite_adi || ""}`
  );

  let hitCount = 0;
  hobbySignals.forEach((signal) => {
    if (signal && searchSpace.includes(signal)) hitCount += 1;
  });

  const ratio = hitCount / hobbySignals.length;
  return Math.round(Math.min(1, ratio) * 100);
}

function computeInterestMatchScore({ ilgi_alanlari, hobbySignals }) {
  if (!ilgi_alanlari || !Array.isArray(ilgi_alanlari) || ilgi_alanlari.length === 0) return 0;
  if (!hobbySignals.length) return 0;

  const normalizedInterests = ilgi_alanlari.map(s => s.trim().toLowerCase());
  const hasMatch = hobbySignals.some(hobby => normalizedInterests.includes(hobby));
  return hasMatch ? 100 : 0;
}

function hasAnyKeywordInText(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function computeCityPriorityScore(item, preferredCitiesText) {
  const pref = normalizeText(preferredCitiesText);
  if (!pref || pref.includes("fark etmez")) return 50;

  const uniText = normalizeText(item.universite_adi || "");
  const cityTokens = pref.split(/\s+/).filter((t) => t.length > 2);
  if (!cityTokens.length) return 50;

  const hasCityMatch = cityTokens.some((token) => uniText.includes(token));
  return hasCityMatch ? 100 : 35;
}

function computeMatchScore({ item, estimatedPuan, hobbySignals, userInterestText, preferredCities }) {
  const min = toNumberOrNull(item.en_kucuk_puan);
  if (min === null) return 0;

  // Puan yakınlığı: taban puana göre
  const dist = Math.abs(estimatedPuan - min);
  const scoreByPuan = Math.round(Math.max(0, 100 - dist)); // Yakınlık skoru

  // 0-100 arası ilgi alanı eşleşmesi
  const scoreByInterest = computeInterestMatchScore({ ilgi_alanlari: item.ilgi_alanlari, hobbySignals });

  // Yeni ağırlıklar: puan yakınlığı (%30), ilgi alanı (%70)
  let weightedScore = scoreByPuan * 0.3 + scoreByInterest * 0.7;

  // Agresif kural: teknoloji/yazılım odaklı kullanıcıya bilişim bölümlerini öne çek.
  const techUserKeywords = ["yazilim", "kod", "kodlama", "bilgisayar", "teknoloji", "siber", "program"];
  const techProgramKeywords = ["yazilim", "bilgisayar", "siber", "program", "arka yuz", "otomasyon", "bilisim"];

  const userWantsTech = hasAnyKeywordInText(userInterestText, techUserKeywords);
  const programText = normalizeText(`${item.program_adi || ""} ${item.fakulte_myo_adi || ""}`);
  const isTechProgram = hasAnyKeywordInText(programText, techProgramKeywords);

  if (userWantsTech && isTechProgram) {
    weightedScore += 50;
  } else if (userWantsTech && !isTechProgram) {
    // Alakasız bölüm cezası
    weightedScore *= 0.7;
  }

  const cityScore = computeCityPriorityScore(item, preferredCities);
  weightedScore = weightedScore * 0.85 + cityScore * 0.15;

  return Math.max(0, Math.min(100, Math.round(weightedScore)));
}

function filterTop5Programs(veri, profile) {
  try {
    const { obp, tytToplam, aytToplam, hobiler, ruhHali, sehirTercihi, hedefBolum } = profile;

    const estimatedTYT = estimateTYTPuan({ tytToplam, obp });
    const estimatedAYT = estimateAYTPuan({ aytToplam, obp });

    // İkili Arama Sistemi
    const isTargetMode = hedefBolum && hedefBolum.trim() && normalizeText(hedefBolum) !== 'bilmiyorum';

    if (isTargetMode) {
      let filtered = [];
      // DURUM A: Hedef bölüm spesifik
      const targetQuery = normalizeText(hedefBolum);
      veri.forEach((item) => {
        const programText = normalizeText(item.program_adi || "");
        if (programText.includes(targetQuery)) {
          const puanTuru = String(item.puan_turu || "").toUpperCase();
          const estimatedPuan = puanTuru === "AYT" ? estimatedAYT : estimatedTYT;
          const min = toNumberOrNull(item.en_kucuk_puan);
          if (min !== null) {
            const diff = min - estimatedPuan;
            // Yeni kategori sınırları (Kullanıcı tarafından tanımlandı)
            let category = 'safety'; // Garanti: öğrenci puanının 15+ altı
            if (diff > 0 && diff <= 30) {
              category = 'reach'; // Zor: 0-30 puan üstü
            } else if (diff >= -15 && diff <= 0) {
              category = 'match'; // Tam Uygun: 15 puan altından eşite kadar
            }
            filtered.push({ item, estimatedPuan, category, diff: Math.abs(diff) });
          }
        }
      });

      // Şehir filtresi
      if (sehirTercihi && sehirTercihi.trim() && !sehirTercihi.includes("fark etmez")) {
        const cityTokens = normalizeText(sehirTercihi).split(/\s+/).filter((t) => t.length > 2);
        const cityFiltered = filtered.filter(({ item }) => {
          const uniText = normalizeText(item.universite_adi || "");
          return cityTokens.some((token) => uniText.includes(token));
        });
        if (cityFiltered.length > 0) {
          filtered = cityFiltered;
        }
        // Eğer şehirde uygun yoksa, şehir şartı olmadan devam et
      }

      // Karma liste: her kategoriden sıralanmış gruplar → Reach→Match→Safety düzeni
      const reachA = filtered.filter(x => x.category === 'reach').sort((a, b) => a.diff - b.diff);
      const matchA = filtered.filter(x => x.category === 'match').sort((a, b) => a.diff - b.diff);
      const safetyA = filtered.filter(x => x.category === 'safety').sort((a, b) => a.diff - b.diff);

      const blendedA = [
        ...reachA.slice(0, 4),
        ...matchA.slice(0, 8),
        ...safetyA.slice(0, 4),
      ];
      // Boş kategori varsa geri kalanlardan tamamla (Fallback kuralı)
      const remainingA = [...reachA.slice(4), ...matchA.slice(8), ...safetyA.slice(4)];
      blendedA.push(...remainingA.slice(0, Math.max(0, 20 - blendedA.length)));

      return blendedA.slice(0, 20);

    } else {
      // DURUM B: Bilmiyorum veya boş - Optimize Dinamik Arama
      const arananKelimeler = extractHobbySignals(hobiler, ruhHali);

      // ─── ADIM 1: PUAN ÖN FİLTRESİ (tüm veri üzerinde tek pass, sadece sayısal karşılaştırma)
      // Reach sınırı: max 30 puan üstü; safety alt sınırı yok
      const puanPreFiltered = veri.filter(item => {
        const min = toNumberOrNull(item.en_kucuk_puan);
        if (min === null) return false;
        const puanTuru = String(item.puan_turu || "").toUpperCase();
        const ep = puanTuru === "TYT" ? estimatedTYT : Math.max(estimatedTYT, estimatedAYT);
        return min <= ep + 30; // Reach: max 30 puan üstü; güvenlik alt sınır yok
      });

      // ─── ADIM 2: ŞEHİR ÖN FİLTRESİ (azaltılmış küme üzerinde, fallback var)
      let cityPreFiltered = puanPreFiltered;
      if (sehirTercihi && sehirTercihi.trim() && !sehirTercihi.includes("fark etmez")) {
        const cityTokens = normalizeText(sehirTercihi).split(/\s+/).filter(t => t.length > 2);
        const cityMatches = puanPreFiltered.filter(item => {
          const uniText = normalizeText(item.universite_adi || "");
          return cityTokens.some(token => uniText.includes(token));
        });
        if (cityMatches.length > 0) cityPreFiltered = cityMatches;
        // Şehirde sonuç yoksa şehir filtresi iptal, tüm puan ön filtresine dön
      }

      // ─── ADIM 3: KELIME/HOBİ SKORU — sadece ön filtrelenmiş küçük küme üzerinde
      const scored = cityPreFiltered.map(item => {
        let uyumSkoru = 0;
        if (arananKelimeler.length > 0) {
          arananKelimeler.forEach(kelime => {
            const programAdi = (item.program_adi || "").toLowerCase();
            const ilgiAlanlari = item.ilgi_alanlari || [];
            if (programAdi.includes(kelime) || ilgiAlanlari.some(e => e.toLowerCase().includes(kelime))) {
              uyumSkoru++;
            }
          });
        }
        const puanTuru = String(item.puan_turu || "").toUpperCase();
        const estimatedPuan = puanTuru === "TYT" ? estimatedTYT : Math.max(estimatedTYT, estimatedAYT);
        const diff = toNumberOrNull(item.en_kucuk_puan) - estimatedPuan;
        let category = 'safety'; // Garanti: 15+ puan altı
        if (diff > 0 && diff <= 30)      category = 'reach'; // Zor: 0-30 üstü
        else if (diff >= -15 && diff <= 0) category = 'match'; // Tam Uygun
        return { item, uyumSkoru, estimatedPuan, category, diff: Math.abs(diff) };
      });

      // Hobi kelimesi varsa sıfır eşleşmeleri filtrele (Asla Boş Dönme korunuyor)
      let filtered = arananKelimeler.length > 0
        ? scored.filter(({ uyumSkoru }) => uyumSkoru > 0)
        : scored;
      // Fallback: hiç eşleşme yoksa tüm ön filtrelenmiş sonuçları kullan
      if (filtered.length === 0) filtered = scored;

      // ─── ADIM 4: KARMA LİSTE — Reach→Match→Safety dengeli sıralama
      const sortByScore = (a, b) => b.uyumSkoru - a.uyumSkoru || a.diff - b.diff;
      const reachB  = filtered.filter(x => x.category === 'reach').sort(sortByScore);
      const matchB  = filtered.filter(x => x.category === 'match').sort(sortByScore);
      const safetyB = filtered.filter(x => x.category === 'safety').sort(sortByScore);

      const blendedB = [
        ...reachB.slice(0, 3),   // En üste 3 Zor/Hayal
        ...matchB.slice(0, 6),   // Ortaya 6 Tam Uygun
        ...safetyB.slice(0, 3),  // Alta 3 Garanti
      ];
      // Boş kategoriler varsa geri kalanlardan tamamla (Fallback kuralı)
      const remainingB = [...reachB.slice(3), ...matchB.slice(6), ...safetyB.slice(3)];
      blendedB.push(...remainingB.slice(0, Math.max(0, 20 - blendedB.length)));

      return blendedB.slice(0, 20);
    }

    return [];
  } catch (error) {
    console.error("Filtreleme hatası:", error);
    return [];
  }
}

function renderCards(scoredTop5) {
  els.resultsCardsContainer.innerHTML = "";

  scoredTop5.forEach(({ item, uyumSkoru, category }) => {
    const card = document.createElement("article");
    card.className = "bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer";

    const uni = item.universite_adi || "-";
    const fakulte = item.fakulte_myo_adi || "";
    const bolum = item.program_adi || "-";
    const puanTuru = item.puan_turu ? String(item.puan_turu) : "";

    let badgeText = "";
    let badgeClass = "";
    if (category === 'reach') {
      badgeText = "🎯 Biraz Üstü";
      badgeClass = "bg-orange-100 text-orange-800 border-orange-300/50";
    } else if (category === 'match') {
      badgeText = "✅ Tam Uygun";
      badgeClass = "bg-green-100 text-green-800 border-green-300/50";
    } else if (category === 'safety') {
      badgeText = "🛡️ Garanti Seçenek";
      badgeClass = "bg-blue-100 text-blue-800 border-blue-300/50";
    }

    // % Uyum skoru hesapla
    let scoreText;
    if (uyumSkoru !== undefined && uyumSkoru > 0) {
      const yuzde = Math.min(99, 75 + (uyumSkoru * 5));
      scoreText = `%${yuzde} Uyumlu`;
    } else {
      scoreText = `Taban: ${item.en_kucuk_puan}`;
    }

    card.innerHTML = `
      <div class="mb-3 pb-3 border-b border-blue-200/50">
        <div class="font-bold text-slate-900 text-sm mb-1">${bolum}</div>
        <div class="text-xs text-slate-600 mb-2">${uni}${fakulte ? ` • ${fakulte}` : ""}</div>
        <div class="flex gap-2 flex-wrap">
          ${badgeText ? `<div class="inline-block px-2 py-1 rounded-full text-xs font-bold border ${badgeClass}">${badgeText}</div>` : ''}
          <div class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">${scoreText}</div>
        </div>
      </div>
      <ul class="text-xs text-slate-600 space-y-1">
        <li>Taban Puan: ${item.en_kucuk_puan} (${puanTuru})</li>
        <li>Tür: ${item.tip || "-"}</li>
      </ul>
    `;

    // Üniversite bilgisini data attribute olarak ekle
    card.dataset.uniAdi = uni;
    card.dataset.fakulteAdi = fakulte;
    card.dataset.programAdi = bolum;
    card.dataset.enKucukPuan = item.en_kucuk_puan;
    card.dataset.puanTuru = puanTuru;
    card.dataset.category = category || '';

    // Click event
    card.addEventListener('click', () => {
      handleUniversityClick(card.dataset);
    });

    els.resultsCardsContainer.appendChild(card);
  });
}

function handleUniversityClick(uniData) {
  if (!state.studentProfile) return;
  if (state.isLoading || isApiCooldownActive()) {
    const msg = isApiCooldownActive()
      ? `Sistem yogun. Lutfen ${getCooldownSecondsLeft()} saniye sonra tekrar deneyin.`
      : "Bir istek zaten devam ediyor, lutfen bekleyin.";
    setStatus(msg, "error");
    showApiToast(msg, "error");
    return;
  }

  const profile = state.studentProfile;
  const prompt = `Bana ${uniData.programAdi} bölümünü ve ${uniData.uniAdi} üniversitesini detaylı anlat. Öğrencinin net bilgileri: TYT Toplam: ${profile.tytToplam}, AYT/YDT Toplam: ${profile.aytToplam}, Alan: ${profile.alan}.`;

  addMessage({ author: "user", text: prompt });
  setStatus("Hoca düşünüyor...", "ok");
  setComposerEnabled(false);
  state.isLoading = true;

  const typingEl = addTypingIndicator();
  callGeminiForUniversity(uniData, profile).then(reply => {
    typingEl.remove();
    addMessage({ author: "bot", text: reply });
    scrollPageToLatestChatMessage();
  }).catch(err => {
    typingEl.remove();
    const msg = err?.message || "Bilinmeyen";
    addMessage({ author: "bot", text: `Hata olustu: ${msg}.` });
    setStatus(msg, "error");
    showApiToast(msg, "error");
  }).finally(() => {
    state.isLoading = false;
    setComposerEnabled(true);
    setStatus("Hazır", "ok");
  });
}

async function callGeminiForUniversity(uniData, profile) {
  if (!API_KEY || API_KEY.trim() === "" || API_KEY === "APIKEY") {
    throw new Error("Gemini API anahtarı eksik veya geçersiz. Lütfen API_KEY değişkenini güncelleyin.");
  }

  const uniAdi = String(uniData.uniAdi || "").trim();
  const programAdi = String(uniData.programAdi || "").trim();
  if (!uniAdi || !programAdi) {
    throw new Error("Üniversite veya bölüm bilgisi alınamadı. Lütfen kartın doğru bilgileri içerdiğinden emin olun.");
  }

  let systemPrompt = `Kullanıcı bir üniversite/bölüm hakkında bilgi istediğinde şunları mutlaka açıkla: 1) Üniversitenin kampüs ve laboratuvar imkanları, 2) Mezuniyet sonrası iş olanakları ve sektör durumu, 3) Burs imkanları. En Önemlisi: Öğrencinin sana iletilen güncel TYT/AYT netleri, hedeflenen bölümün taban netlerinin altındaysa, aradaki farkı vurgula ve hangi derslere/konulara daha çok çalışması gerektiği konusunda stratejik, motive edici bir eylem planı sun.

KURAL 1 (MATEMATİK - 80 SORU KURALI): Öğrencinin AYT netini 80 soru üzerinden değerlendir! Öğrenci 53 net yapmışsa bu 80 soruda 53 nettir (%66 başarı) ve ÇOK İYİDİR. Öğrenciye ASLA '65-75 net yapmalısın' gibi ütopik Türkiye derecesi hedefleri verme. Öğrencinin mevcut netini küçümseme.

KURAL 2 (ZAMAN VE SINIF): Öğrenci 12. sınıf ise ona 'TYT Matematiği sıfırdan başla, her şeyi çalış' şeklinde aylarca sürecek destanlar yazma! Sınava çok kısa süre kaldığını varsay. Tavsiyelerin 'kısa vadeli, nokta atışı ve mevcut netleri sadece 3-5 net artırmaya yönelik gerçekçi/stratejik' olsun.

KURAL 3 (ALAN VE DERS SINIRLAMASI): Öğrenci Eşit Ağırlık bölümü istiyorsa Fen çalışma tavsiyesi KESİNLİKLE verme. Sayısal bölüm istiyorsa Edebiyat/Tarih/Coğrafya tavsiyesi KESİNLİKLE verme.

Öğrencinin Alanına Göre Zorunlu Dersler ve Tavsiye Sınırları:

Eğer öğrenci SAYISAL (SAY) hedefliyorsa:
Sadece AYT Matematik ve AYT Fen Bilimleri (Fizik, Kimya, Biyoloji) netlerini değerlendir.
Bu öğrenciye KESİNLİKLE Edebiyat, Tarih veya Coğrafya çalışması yönünde tavsiye VERME.

Eğer öğrenci EŞİT AĞIRLIK (EA) hedefliyorsa (Örn: Spor Yöneticiliği, Hukuk, Psikoloji):
Sadece AYT Matematik ve AYT Türk Dili ve Edebiyatı - Sosyal Bilimler-1 (Tarih-1, Coğrafya-1) netlerini değerlendir.
Bu öğrenciye KESİNLİKLE AYT Fizik, Kimya veya Biyoloji çalışması yönünde tavsiye VERME. (TYT Fen hariç).

Eğer öğrenci SÖZEL (SÖZ) hedefliyorsa:
Sadece AYT Edebiyat/Sosyal-1 ve AYT Sosyal Bilimler-2 testlerini değerlendir.
Bu öğrencinin AYT Matematik veya AYT Fen neti düşükse (veya sıfırsa) KESİNLİKLE bunu bir eksiklik olarak görüp eleştirme, çünkü SÖZEL puanında bu testlerin hiçbir etkisi yoktur!

Yapay zekanın sadece öğrencinin hedeflediği puan türünün (SAY/EA/SÖZ) gerektirdiği testlere odaklanmasını, ilgisiz AYT testleri hakkında yorum yapmamasını sağlayacak bu kuralı sisteme entegre et. Asla bir öğrenciye bir dersteki maksimum soru sayısından daha yüksek bir net hedefi koyma. AYT'de (Alan Yeterlilik Testleri) - Öğrenci kendi alanında sadece 80 sorudan sorumludur. Örnek: Spor Yöneticiliği gibi Eşit Ağırlık/Sözel alanlarından alan bölümler için 30-40 AYT neti bile çoğu zaman yeterliyken, 51 neti olan birine 'bu netlerle yerleşemezsin' demek büyük bir hatadır. Öğrencinin hedeflediği bölümün gerçekçi Türkiye sıralamalarını ve net ortalamalarını baz al.

KURAL 4 (YETERLİ NET DURUMU): Eğer öğrencinin mevcut netleri (TYT veya AYT), hedeflediği bölüm/üniversite için zaten yeterli veya yüksekse, ona KESİNLİKLE daha yüksek net hedefleri (örn: '90-100 yapmalısın', 'netlerini artırmalısın') VERME. Bunun yerine tam olarak şu tonda konuş:
'Mevcut netlerin bu bölüm için gayet yeterli ve sana rahat bir yerleşme imkanı sunuyor. Bu saatten sonra kendini yıpratmana gerek yok. Sadece bu seviyeni korumak için bol deneme çözebilirsin. Eğer kendini özel olarak geliştirmek istediğin, merak ettiğin bir ders veya konu varsa o alanda sana seve seve yardımcı olurum.'`;

  if (uniData.category === 'reach') {
    systemPrompt += ` Öğrencinin seçtiği bu bölüm şu anki netlerinin biraz üzerinde. Ona sıfırdan her şeyi çalışmasını söylemek yerine, sadece aradaki o ufak puan/net farkını (örn: 10-15 net) kapatması için hangi 2-3 spesifik konuya veya deneme stratejisine odaklanması gerektiğini söyle.`;
  }

  const userPrompt = `Üniversite: ${uniAdi}
Bölüm: ${programAdi}
Taban Puan: ${uniData.enKucukPuan || "-"} (${uniData.puanTuru || "-"})

Öğrencinin Net Bilgileri:
Alan: ${profile.alan}
TYT Netleri - Türkçe: ${profile.tytTurkce}, Sosyal: ${profile.tytSosyal}, Matematik: ${profile.tytMat}, Fen: ${profile.tytFen} (Toplam: ${profile.tytToplam})
AYT/YDT Netleri: ${profile.aytToplam > 0 ? profile.aytToplam : 'Henüz girilmemiş'}
OBP: ${profile.obp}

Bu üniversite ve bölüm hakkında detaylı bilgi ver.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const payload = {
    contents: [
      {
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw createApiError(response.status, errText);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";
}

async function callGemini({ profile, top5Items }) {
  if (!API_KEY || API_KEY === "APIKEY") {
    throw new Error("Gemini API anahtarı boş. `API_KEY` değişkenini doldur.");
  }

  // Netleri doğru göster
  const tytNet = typeof profile.tytToplam === 'number' && !isNaN(profile.tytToplam) ? profile.tytToplam : 'Girilmeyen';
  const aytNet = typeof profile.aytToplam === 'number' && !isNaN(profile.aytToplam) ? profile.aytToplam : 'Girilmeyen';

  // Liste boşsa LLM'ye erken yanıt döndür — hallucination'ı tamamen engelle
  if (!top5Items || top5Items.length === 0) {
    return 'Mevcut kriterlerine (hobiler, puan ve şehir) uygun bir bölüm/üniversite bulunamadı. Lütfen hobiler veya şehir tercihini değiştirerek tekrar deneyin.';
  }

  const ANTI_HALLUCINATION_RULE = `\n\nÖNEMLİ KISITLAMA — HALLUCINATION YASAĞI: Sana aşağıda öğrencinin kriterlerine uygun sistemin bulduğu okulların listesi verilmiştir. SADECE VE SADECE bu listedeki okulları önerebilirsin. Bu listenin dışında herhangi bir okul, bölüm veya üniversite uydurma! Listedeki okulları sun, ardından öğrenciye sağdaki kartlardan birini seçip ayrıntılı analiz isteyebileceğini hatırlat.`;
  const YETERLILIK_KURALI = `\n\nKURAL (YETERLİ NET DURUMU): Eğer öğrencinin mevcut netleri, önerilen bölümler için zaten yeterli veya yüksekse, ona ASLA 'netlerini daha da artırmalısın' gibi hedefler verme. Bunun yerine şu tonda konuş: 'Mevcut netlerin bu bölüm için gayet yeterli ve sana rahat bir yerleşme imkanı sunuyor. Kendini yıpratmana gerek yok, bu seviyeyi koruman yeterli.'`;

  let userPrompt = '';
  let systemPrompt = '';
  const sinif = String(profile.sinif || '').trim();
  if (sinif === '9' || sinif === '10') {
    systemPrompt = `Sen 9. veya 10. sınıf bir öğrenciye koçluk yapıyorsun. Bu öğrencinin önünde daha çok uzun yıllar var. Kesinlikle YKS stresi yaratma, AYT netlerinden veya sınavın zorluğundan BAHSETME. Eğer öğrenci TYT neti girmişse (örneğin 70-80 arası), 9. sınıf için bu netin çok iyi ve harika bir başlangıç olduğunu söyleyip onu motive et sadece seçtiği bölüm için netlerini ne kadar arttırması gerektiğini söyle ki öğrenci ona göre çalışabilsin.` + ANTI_HALLUCINATION_RULE + YETERLILIK_KURALI;
    userPrompt = [
      `Öğrencinin bilgileri:`,
      `OBP: ${profile.obp}`,
      `TYT net: ${tytNet}`,
      `Hobiler: ${profile.hobiler}`,
      `Ruh hali: ${profile.ruhHali}`,
      `Sınıf/Seviye: ${profile.sinif}`,
      `Şehir tercihi: ${profile.sehirTercihi}`,
      ``,
      `Seçilen 5 bölüm (master_data.json'dan):`,
      JSON.stringify(
        top5Items.map((x) => ({
          program_adi: x.item.program_adi,
          universite_adi: x.item.universite_adi,
          puan_turu: x.item.puan_turu,
          en_kucuk_puan: x.item.en_kucuk_puan,
          tip: x.item.tip,
          ilgi_alanlari: x.item.ilgi_alanlari,
          uyum: x.score,
        })),
        null,
        2
      ),
    ].join("\n");
  } else {
    // 11, 12, Mezunlar için mevcut prompt
    systemPrompt = getSystemPrompt(profile) + ANTI_HALLUCINATION_RULE + YETERLILIK_KURALI;
    userPrompt = [
      `Öğrencinin bilgileri:`,
      `OBP: ${profile.obp}`,
      `TYT net: ${tytNet}`,
      `AYT net: ${aytNet}`,
      `Hobiler: ${profile.hobiler}`,
      `Ruh hali: ${profile.ruhHali}`,
      `Sınıf/Seviye: ${profile.sinif}`,
      `Şehir tercihi: ${profile.sehirTercihi}`,
      ``,
      `Seçilen 5 bölüm (master_data.json'dan):`,
      JSON.stringify(
        top5Items.map((x) => ({
          program_adi: x.item.program_adi,
          universite_adi: x.item.universite_adi,
          puan_turu: x.item.puan_turu,
          en_kucuk_puan: x.item.en_kucuk_puan,
          tip: x.item.tip,
          ilgi_alanlari: x.item.ilgi_alanlari,
          uyum: x.score,
        })),
        null,
        2
      ),
    ].join("\n");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw createApiError(res.status, errText);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  return text || "Gemini yanıtı alınamadı. (Boş çıktı)";
}

async function callGeminiWithHistory() {
  if (!API_KEY || API_KEY === "APIKEY") {
    throw new Error("Gemini API anahtarı boş. `API_KEY` değişkenini doldur.");
  }

  const contents = state.messages.map((msg) => ({
    role: msg.author === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: `${getChatSystemPrompt(state.studentProfile)}\n\n${state.messages.map((msg) => `${msg.author === 'user' ? 'Kullanıcı:' : 'Asistan:'} ${msg.text}`).join('\n')}` }],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw createApiError(res.status, errText);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";

  return text || "Bu mesaja uygun bir yanıt üretemedim, biraz daha detay paylaşabilir misin?";
}

function readProfileFromForm() {
  const formData = new FormData(els.profileForm);
  const profile = {
    alan: formData.get("alan")?.toString().trim() || "",
    obp: toNumberOrNull(formData.get("obp")?.toString().trim()),
    tytTurkce: toNumberOrNull(formData.get("tytTurkce")?.toString().trim()),
    tytSosyal: toNumberOrNull(formData.get("tytSosyal")?.toString().trim()),
    tytMat: toNumberOrNull(formData.get("tytMat")?.toString().trim()),
    tytFen: toNumberOrNull(formData.get("tytFen")?.toString().trim()),
    hobiler: formData.get("hobiler")?.toString().trim() || "",
    hedefBolum: formData.get("hedefBolum")?.toString().trim() || "",
    ruhHali: formData.get("ruhaHali")?.toString().trim() || "",
    sinif: formData.get("sinif")?.toString().trim() || "",
    sehirTercihi: formData.get("sehirTercihi")?.toString().trim() || "",
  };

  const aytFields = document.querySelectorAll('#aytFields input');
  aytFields.forEach(input => {
    const name = input.name;
    const value = toNumberOrNull(input.value);
    if (name) {
      profile[name] = value !== null ? value : 0;
    }
  });

  profile.tytToplam = (profile.tytTurkce || 0) + (profile.tytSosyal || 0) + (profile.tytMat || 0) + (profile.tytFen || 0);
  profile.aytToplam = 0;

  if (profile.alan === 'SAY') {
    profile.aytToplam = (profile.aytMat || 0) + (profile.aytFiz || 0) + (profile.aytKim || 0) + (profile.aytBiy || 0);
  } else if (profile.alan === 'EA') {
    profile.aytToplam = (profile.aytMat || 0) + (profile.aytEdeb || 0) + (profile.aytTar1 || 0) + (profile.aytCog1 || 0);
  } else if (profile.alan === 'SÖZ') {
    profile.aytToplam = (profile.aytEdeb || 0) + (profile.aytTar1 || 0) + (profile.aytCog1 || 0) + (profile.aytTar2 || 0) + (profile.aytCog2 || 0) + (profile.aytFelGrubu || 0) + (profile.aytDin || 0);
  } else if (profile.alan === 'DİL') {
    profile.aytToplam = profile.ydtNet || 0;
  } else if (profile.alan === 'KARAR') {
    profile.aytToplam = 0;
  }

  return profile;
}

async function startChat(profile) {
  if (state.isChatStarted) return;
  state.isChatStarted = true;
  state.studentProfile = profile; // Profil sakla

  setComposerEnabled(false);
  setStatus("Sohbet başlatılıyor...", "ok");
  state.isLoading = true;

  // 1) Kullanıcı mesajı olarak form özetini ekle
  // Netleri doğru göster
  const tytNet = typeof profile.tytToplam === 'number' && !isNaN(profile.tytToplam) ? profile.tytToplam : 'Girilmeyen';
  const aytNet = typeof profile.aytToplam === 'number' && !isNaN(profile.aytToplam) ? profile.aytToplam : 'Girilmeyen';
  addMessage({
    author: "user",
    text:
      `Form bilgilerimi aldın:\n` +
      `OBP: ${profile.obp}\nTYT: ${tytNet}\nAYT: ${aytNet}\n` +
      `Hobiler: ${profile.hobiler}\nRuh hali: ${profile.ruhHali}\nSınıf: ${profile.sinif}\n` +
      `Şehir tercihi: ${profile.sehirTercihi}`,
  });

  const loadingBubble = addLoadingMessage();
  let dots = 0;
  const loadingTimer = window.setInterval(() => {
    dots = (dots + 1) % 4;
    loadingBubble.textContent = `Yükleniyor${".".repeat(dots)}`;
  }, 450);

  try {
    setStatus("veri.json okunuyor...", "ok");
    const veri = await loadLocalVeri();

    setStatus("en mantıklı 5 bölüm seçiliyor...", "ok");
    const allMatches = filterTop5Programs(veri, profile);
    state.allMatches = allMatches;
    state.currentMatchStart = 0;
    renderMatchPage(0);
    // Kartlar görünür olur olmaz kullanıcıyı bu alana indir.
    scrollPageToCards();

    setStatus("Gemini'den yanıt alınıyor...", "ok");
    // API isteği beklerken sonuç kartlarına scroll
    scrollPageToCards();
    const reply = await callGemini({ profile, top5Items: allMatches.slice(0, 5) });

    window.clearInterval(loadingTimer);
    loadingBubble.remove();
    addMessage({ author: "bot", text: reply });
    // Yanıt geldiğinde tekrar konuşmanın sonuna odaklan.
    scrollPageToLatestChatMessage();
    setComposerEnabled(true);
    setStatus("Hazır", "ok");
    els.startBtn.disabled = false;
  } catch (err) {
    window.clearInterval(loadingTimer);
    // Hata mesajını kullanıcıya göster.
    const msg = err?.message ? String(err.message) : "Beklenmeyen bir hata oluştu.";
    loadingBubble.remove();
    addMessage({
      author: "bot",
      text:
        `Sorun çıktı: ${msg}\n\n` +
        `İpucu: ` +
        `Gemini API anahtarını ` +
        `\`API_KEY\` içine eklemeyi ve projeyi bir yerel sunucuda (fetch için) açmayı deneyebilirsin.`,
    });
    state.isChatStarted = false;
    els.startBtn.disabled = false;
    setComposerEnabled(true);
    setStatus("Hazır", "ok");
  } finally {
    state.isLoading = false;
  }
}

if (els.landingStartBtn) {
  els.landingStartBtn.addEventListener("click", () => {
    els.landingPage.classList.remove("is-active");
    els.landingPage.classList.add("hidden");
    els.dataEntryPage.classList.add("is-active");
    els.dataEntryPage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Alan değişikliği için dinamik AYT alanları
function updateAYTFields(alan) {
  const aytContainer = document.getElementById('aytContainer');
  const aytFields = document.getElementById('aytFields');
  aytFields.innerHTML = '';

  if (!alan || alan === 'KARAR') {
    aytContainer.classList.add('hidden');
    return;
  }

  let fields = [];

  if (alan === 'SAY') {
    fields = [
      { name: 'aytMat',  label: 'AYT Matematik (40 soru)', max: 40 },
      { name: 'aytFiz',  label: 'AYT Fizik (14 soru)',      max: 14 },
      { name: 'aytKim',  label: 'AYT Kimya (13 soru)',      max: 13 },
      { name: 'aytBiy',  label: 'AYT Biyoloji (13 soru)',   max: 13 }
    ];
  } else if (alan === 'EA') {
    fields = [
      { name: 'aytMat',  label: 'AYT Matematik (40 soru)',   max: 40 },
      { name: 'aytEdeb', label: 'AYT Edebiyat (24 soru)',    max: 24 },
      { name: 'aytTar1', label: 'AYT Tarih-1 (10 soru)',     max: 10 },
      { name: 'aytCog1', label: 'AYT Coğrafya-1 (6 soru)',   max: 6  }
    ];
  } else if (alan === 'SÖZ') {
    fields = [
      { name: 'aytEdeb',     label: 'AYT Edebiyat (24 soru)',          max: 24 },
      { name: 'aytTar1',     label: 'AYT Tarih-1 (10 soru)',           max: 10 },
      { name: 'aytCog1',     label: 'AYT Coğrafya-1 (6 soru)',         max: 6  },
      { name: 'aytTar2',     label: 'AYT Tarih-2 (11 soru)',           max: 11 },
      { name: 'aytCog2',     label: 'AYT Coğrafya-2 (11 soru)',        max: 11 },
      { name: 'aytFelGrubu', label: 'AYT Felsefe Grubu (12 soru)',     max: 12 },
      { name: 'aytDin',      label: 'AYT Din Kültürü (6 soru)',       max: 6  }
    ];
  } else if (alan === 'DİL') {
    fields = [
      { name: 'ydtNet', label: 'YDT Net (80 soru)', max: 80 }
    ];
  }

  fields.forEach(field => {
    const div = document.createElement('div');
    const maxAttr = field.max ? `max="${field.max}"` : '';
    div.innerHTML = `
      <label for="${field.name}" class="block text-sm font-semibold text-slate-700 mb-2">${field.label}</label>
      <input id="${field.name}" name="${field.name}" type="number" inputmode="decimal" step="0.1" min="0" ${maxAttr} placeholder="Örn: 8.0" required
        oninput="clampInputMax(this)"
        class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white/50 backdrop-blur-sm" />
    `;
    aytFields.appendChild(div);
  });

  aytContainer.classList.remove('hidden');
}

// Alan seçimi event'i
document.getElementById('alan').addEventListener('change', (e) => {
  updateAYTFields(e.target.value);
});

els.profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.isLoading) return;
  if (isApiCooldownActive()) {
    const msg = `Su an sistemde yogunluk var, lutfen ${getCooldownSecondsLeft()} saniye bekleyip tekrar deneyin.`;
    setStatus(msg, "error");
    showApiToast(msg, "error");
    return;
  }
  els.startBtn.disabled = true;

  const profile = readProfileFromForm();

  // Güncellenmiş doğrulama
  if (
    !profile.alan ||
    profile.obp === null ||
    profile.tytTurkce === null ||
    profile.tytSosyal === null ||
    profile.tytMat === null ||
    profile.tytFen === null ||
    !profile.hobiler ||
    !profile.ruhHali ||
    !profile.sinif ||
    !profile.sehirTercihi
  ) {
    setStatus("Lütfen tüm alanları doldurun", "ok");
    els.startBtn.disabled = false;
    return;
  }

  // AYT alanlarını kontrol et
  if (['SAY', 'EA', 'SÖZ'].includes(profile.alan) && profile.aytToplam === 0) {
    setStatus("Lütfen AYT netlerinizi giriniz", "ok");
    els.startBtn.disabled = false;
    return;
  }

  if (profile.alan === 'DİL' && (profile.ydtNet === null || profile.ydtNet === undefined)) {
    setStatus("Lütfen YDT netinizi giriniz", "ok");
    els.startBtn.disabled = false;
    return;
  }

  startChat(profile);
});

els.chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.isChatStarted || state.isLoading) return;
  if (isApiCooldownActive()) {
    const msg = `Su an sistemde yogunluk var, lutfen ${getCooldownSecondsLeft()} saniye bekleyip tekrar deneyin.`;
    setStatus(msg, "error");
    showApiToast(msg, "error");
    return;
  }

  // Sağ panel beklenmedik şekilde boşaldıysa aktif sonuç sayfasını tekrar çiz.
  if (Array.isArray(state.allMatches) && state.allMatches.length > 0 && els.resultsCardsContainer.childElementCount === 0) {
    renderMatchPage(state.currentMatchStart || 0);
  }

  const text = els.chatInput.value.trim();
  if (!text) return;

  addMessage({ author: "user", text });
  els.chatInput.value = "";
  state.isLoading = true;
  setComposerEnabled(false);
  setStatus("Hoca düşünüyor...", "ok");

  const typingEl = addTypingIndicator();
  try {
    const reply = await callGeminiWithHistory();
    typingEl.remove();
    addMessage({ author: "bot", text: reply });
    scrollPageToLatestChatMessage();
  } catch (err) {
    typingEl.remove();
    const msg = err?.message || "Bilinmeyen hata.";
    addMessage({
      author: "bot",
      text: `Sohbet sirasinda bir sorun olustu: ${msg}`,
    });
    setStatus(msg, "error");
    showApiToast(msg, "error");
  } finally {
    state.isLoading = false;
    setComposerEnabled(true);
    setStatus("Hazır", "ok");
    els.chatInput.focus();
  }
});

if (els.nextMatchesBtn) {
  els.nextMatchesBtn.addEventListener("click", () => {
    if (!state.allMatches.length) return;
    let nextStart = state.currentMatchStart + 5;
    if (nextStart >= state.allMatches.length) {
      nextStart = 0;
    }
    state.currentMatchStart = nextStart;
    renderMatchPage(nextStart);
    scrollPageToCards();
  });
}

if (els.backToFormBtn) {
  els.backToFormBtn.addEventListener("click", () => {
    // Step 3 -> Step 2 geçişi
    els.resultsPage.classList.remove("is-active");
    els.resultsPage.classList.add("hidden");
    els.dataEntryPage.classList.remove("hidden");
    els.dataEntryPage.classList.add("is-active");
    setStatus("Formu düzenleyin ve yeniden başlatın", "ok");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Menü toggle event listener
if (els.menuToggle) {
  els.menuToggle.addEventListener("click", () => {
    state.isMenuOpen = !state.isMenuOpen;
    if (els.dropdownMenu) {
      els.dropdownMenu.classList.toggle("hidden", !state.isMenuOpen);
    }
  });
}

// Initial UI state
setComposerEnabled(false);
setStatus("Hazır", "ok");
if (els.nextMatchesBtn) els.nextMatchesBtn.classList.remove("is-visible");
if (els.landingPage) {
  els.landingPage.classList.add("is-active");
  els.landingPage.classList.remove("hidden");
}
if (els.dataEntryPage) {
  els.dataEntryPage.classList.add("hidden");
  els.dataEntryPage.classList.remove("is-active");
}
if (els.resultsPage) {
  els.resultsPage.classList.add("hidden");
  els.resultsPage.classList.remove("is-active");
}


