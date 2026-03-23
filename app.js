// UI iskeleti: Görev 1 kapsamında formdan sohbet başlatma akışını hazırlar.
// Sonraki görevlerde veri.json filtreleme ve Gemini API entegrasyonu eklenecek.

// Görev 4: Gemini API anahtarı (daha sonra kendi anahtarınla güncelleyeceksin)
const API_KEY = "AIzaSyAJLz21ZJTzy2XVOD5oEXHj1nbRTQdpl5g";

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
  cardsContainer: document.getElementById("cardsContainer"),
  statusPill: document.getElementById("statusPill"),
  scrollToCardsBtn: document.getElementById("scrollToCardsBtn"),
  nextMatchesBtn: document.getElementById("nextMatchesBtn"),
};

const state = {
  isChatStarted: false,
  messages: [],
  allMatches: [],
  currentMatchStart: 0,
};

const SYSTEM_PROMPT =
  "Sen 20 yıllık şefkatli bir rehberlik hocasısın. İlk mesajında uzun uzun açıklama yapma. Empatik bir selamla başla ve sadece " +
  "önerdiğin 5 bölümün isimlerini ve ilgili üniversiteleri kısa bir liste olarak sun: 1) ... 5) ... " +
  "formatında. Sonra kullanıcıya 'Hangisi hakkında (kampüs, kariyer, içerik) detaylı bilgi istersin?' diye sor. Uzun madde listeleri veya detaylı analiz doğrudan bu mesajda verme.";
const CHAT_SYSTEM_PROMPT =
  "Sen 20 yıllık şefkatli bir rehberlik hocasısın. Sohbet geçmişini dikkate al, öğrencinin önceki mesajlarını unutma, empatik bir dille kısa ve net yönlendirme yap.";

let localDataCache = null;

function setStatus(text, variant) {
  els.statusPill.textContent = text;
  els.statusPill.classList.remove("pill--ok", "pill--muted");
  els.statusPill.classList.add(variant === "ok" ? "pill--ok" : "pill--muted");
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
  els.cardsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
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
  wrap.className = `message ${author === "user" ? "message--user" : "message--bot"}`;

  const bubble = document.createElement("div");
  bubble.className = "message__bubble";
  const safeText = author === "bot" ? cleanMarkdownText(text) : text;
  bubble.textContent = safeText; // XSS korumalı

  wrap.appendChild(bubble);
  els.chatMessages.appendChild(wrap);
  scrollToMessageStart(wrap);

  state.messages.push({ author, text });
}

function renderQuickReplies(items) {
  let container = document.getElementById("quickRepliesContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "quickRepliesContainer";
    container.className = "quick-replies";
    const mainPanel = document.getElementById("mainPanel");
    const composerWrap = mainPanel.querySelector(".composer-wrap");
    if (composerWrap) {
      composerWrap.parentNode.insertBefore(container, composerWrap);
    } else {
      mainPanel.appendChild(container);
    }
  }

  container.innerHTML = "";

  items.slice(0, 5).forEach(({ item }) => {
    const program = item.program_adi || "Bölüm";
    const uni = item.universite_adi || "Üniversite";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quick-reply-btn";
    btn.textContent = `${program} @ ${uni}`;

    btn.addEventListener("click", async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.classList.add("quick-reply-btn--used");

      const prompt = `Bana ${program} bölümünü ve ${uni} imkanlarını detaylı anlatır mısın?`;
      addMessage({ author: "user", text: prompt });
      setStatus("Hoca düşünüyor...", "ok");
      setComposerEnabled(false);
      const typingEl = addTypingIndicator();

      try {
        const reply = await callGeminiWithHistory();
        typingEl.remove();
        addMessage({ author: "bot", text: reply });
        scrollPageToLatestChatMessage();
      } catch (err) {
        typingEl.remove();
        addMessage({ author: "bot", text: `Hata oluştu: ${err?.message || "Bilinmeyen"}.` });
      } finally {
        setComposerEnabled(true);
        setStatus("Hazır", "ok");
      }
    });

    container.appendChild(btn);
  });
}

function clearQuickReplies() {
  const container = document.getElementById("quickRepliesContainer");
  if (container) container.innerHTML = "";
}

function addLoadingMessage() {
  const wrap = document.createElement("div");
  wrap.className = "message message--bot";

  const bubble = document.createElement("div");
  bubble.className = "message__bubble";
  bubble.textContent = "Yükleniyor...";

  wrap.appendChild(bubble);
  els.chatMessages.appendChild(wrap);
  scrollChatToBottom();

  return bubble;
}

function addTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "message message--bot message--typing";
  wrap.innerHTML = `
    <div class="message__bubble message__bubble--typing" aria-label="Bot yazıyor">
      <span class="typing-label">Yazıyor</span>
      <span class="typing-dots" aria-hidden="true">
        <i></i><i></i><i></i>
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

async function loadLocalVeri() {
  if (localDataCache) return localDataCache;

  const res = await fetch("./veri.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`veri.json yüklenemedi (${res.status}).`);
  const data = await res.json();
  localDataCache = Array.isArray(data) ? data : [];
  return localDataCache;
}

function estimateTYTPuan({ tytNet, obp }) {
  // Basit/approx bir dönüşüm. (Görev 3 MVP; sonraki iterasyonda kalibre edilebilir.)
  // Not: `veri.json` en_kucuk/en_buyuk değerleri "puan" ölçeğindedir.
  return tytNet * 7 + obp * 0.6;
}

function estimateAYTPuan({ aytNet, obp }) {
  // Basit/approx bir dönüşüm.
  return aytNet * 6 + obp * 0.6;
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
  const hobbyTokens = tokenize(`${hobilerText} ${ruhHaliText}`);
  const activeProgramKeywords = new Set();

  hobbyTokens.forEach((token) => {
    const mapped = HOBBY_TO_PROGRAM_KEYWORDS[token];
    if (mapped) mapped.forEach((k) => activeProgramKeywords.add(normalizeText(k)));
  });

  // Kullanıcı doğrudan "siber güvenlik" gibi bölüm odaklı kelime yazarsa da dikkate al.
  hobbyTokens.forEach((token) => activeProgramKeywords.add(normalizeText(token)));
  return Array.from(activeProgramKeywords);
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
  const max = toNumberOrNull(item.en_buyuk_puan);
  if (min === null || max === null) return 0;

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = Math.max(1, hi - lo);
  const mid = lo + span / 2;
  const half = span / 2;
  const dist = Math.abs(estimatedPuan - mid);

  // 0-100 arası puan yakınlığı
  const scoreByPuan = Math.round((1 / (1 + dist / Math.max(1, half))) * 100);
  // 0-100 arası hobi/ruh hali eşleşmesi
  const scoreByHobby = computeKeywordMatchScore({ item, hobbySignals });

  // Yeni ağırlıklar: asıl belirleyici hobi/ilgi (%80), puan yakınlığı (%20)
  let weightedScore = scoreByPuan * 0.2 + scoreByHobby * 0.8;

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
  const { obp, tytNet, aytNet, hobiler, ruhHali, sehirTercihi } = profile;

  const estimatedTYT = estimateTYTPuan({ tytNet, obp });
  const estimatedAYT = estimateAYTPuan({ aytNet, obp });
  const hobbySignals = extractHobbySignals(hobiler, ruhHali);
  const userInterestText = normalizeText(`${hobiler} ${ruhHali}`);

  const scored = veri.map((item) => {
    const puanTuru = String(item.puan_turu || "").toUpperCase();
    const estimatedPuan = puanTuru === "AYT" ? estimatedAYT : estimatedTYT; // MVP: veri daha çok TYT içeriyor.

    const score = computeMatchScore({
      item,
      estimatedPuan,
      hobbySignals,
      userInterestText,
      preferredCities: sehirTercihi,
    });
    return { item, score, estimatedPuan };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function renderCards(scoredTop5) {
  els.cardsContainer.innerHTML = "";

  scoredTop5.forEach(({ item, score }) => {
    const card = document.createElement("article");
    card.className = "match-card";

    const uni = item.universite_adi || "-";
    const fakulte = item.fakulte_myo_adi || "";
    const bolum = item.program_adi || "-";
    const puanTuru = item.puan_turu ? String(item.puan_turu) : "";

    const scoreText = `${score}% Uyum`;

    card.innerHTML = `
      <div class="match-card__top">
        <div>
          <div class="match-card__name">${bolum}</div>
          <div class="match-card__uni">${uni}${fakulte ? ` • ${fakulte}` : ""}</div>
          <div class="match-card__badges">
            <span class="info-badge info-badge--campus">Kampus</span>
            <span class="info-badge info-badge--yurt">Yurt</span>
            <span class="info-badge info-badge--club">Aktif Kulupler</span>
          </div>
        </div>
        <div class="match-card__score">${scoreText}</div>
      </div>
      <ul class="match-card__list">
        <li>Aralık: ${item.en_kucuk_puan} - ${item.en_buyuk_puan} (${puanTuru})</li>
        <li>Üniversite türü: ${item.universite_turu || "-"}</li>
        <li>Öneri: Uyum skoruna göre önceliklendirildi</li>
      </ul>
    `;

    els.cardsContainer.appendChild(card);
  });
}

function renderMatchPage(startIndex = 0) {
  const items = state.allMatches.slice(startIndex, startIndex + 5);
  renderCards(items);

  const hasMore = state.allMatches.length > 5;
  if (hasMore) {
    els.nextMatchesBtn.classList.add("is-visible");
  } else {
    els.nextMatchesBtn.classList.remove("is-visible");
  }
}

async function callGemini({ profile, top5Items }) {
  if (!API_KEY || API_KEY === "APIKEY") {
    throw new Error("Gemini API anahtarı boş. `API_KEY` değişkenini doldur.");
  }

  const userPrompt = [
    `Öğrencinin bilgileri:`,
    `OBP: ${profile.obp}`,
    `TYT net: ${profile.tytNet}`,
    `AYT net: ${profile.aytNet}`,
    `Hobiler: ${profile.hobiler}`,
    `Ruh hali: ${profile.ruhHali}`,
    `Sınıf/Seviye: ${profile.sinif}`,
    `Şehir tercihi: ${profile.sehirTercihi}`,
    ``,
    `Seçilen 5 bölüm (veri.json'dan):`,
    JSON.stringify(
      top5Items.map((x) => ({
        program_adi: x.item.program_adi,
        universite_adi: x.item.universite_adi,
        fakulte_myo_adi: x.item.fakulte_myo_adi,
        universite_turu: x.item.universite_turu,
        puan_turu: x.item.puan_turu,
        en_kucuk_puan: x.item.en_kucuk_puan,
        en_buyuk_puan: x.item.en_buyuk_puan,
        uyum: x.score,
      })),
      null,
      2
    ),
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(API_KEY);

  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
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
    throw new Error(`Gemini isteği başarısız (${res.status}). ${errText}`.trim());
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

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(API_KEY);

  const body = {
    systemInstruction: {
      parts: [{ text: CHAT_SYSTEM_PROMPT }],
    },
    contents,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini sohbet isteği başarısız (${res.status}). ${errText}`.trim());
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
    obp: toNumberOrNull(formData.get("obp")?.toString().trim()),
    tytNet: toNumberOrNull(formData.get("tyt")?.toString().trim()),
    aytNet: toNumberOrNull(formData.get("ayt")?.toString().trim()),
    hobiler: formData.get("hobiler")?.toString().trim() || "",
    ruhHali: formData.get("ruhaHali")?.toString().trim() || "",
    sinif: formData.get("sinif")?.toString().trim() || "",
    sehirTercihi: formData.get("sehirTercihi")?.toString().trim() || "",
  };
  return profile;
}

async function startChat(profile) {
  if (state.isChatStarted) return;
  state.isChatStarted = true;

  clearQuickReplies();
  setComposerEnabled(false);
  setStatus("Sohbet başlatılıyor...", "ok");
  els.cardsContainer.innerHTML = "";
  // Step 2: sonuç ekranında rehberlik akışı devam etsin
  els.scrollToCardsBtn.classList.remove("is-hidden");

  // 1) Kullanıcı mesajı olarak form özetini ekle
  addMessage({
    author: "user",
    text:
      `Form bilgilerimi aldın:\n` +
      `OBP: ${profile.obp}\nTYT: ${profile.tytNet}\nAYT: ${profile.aytNet}\n` +
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
    const reply = await callGemini({ profile, top5Items: allMatches.slice(0, 5) });

    window.clearInterval(loadingTimer);
    loadingBubble.remove();
    addMessage({ author: "bot", text: reply });
    renderQuickReplies(state.allMatches.slice(0, 5));
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
  }
}

if (els.landingStartBtn) {
  els.landingStartBtn.addEventListener("click", () => {
    els.landingPage.classList.remove("is-active");
    setTimeout(() => {
      els.landingPage.classList.add("hidden");
      els.dataEntryPage.classList.remove("hidden");
      setTimeout(() => {
        els.dataEntryPage.classList.add("is-active");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }, 400);
  });
}

els.profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  els.startBtn.disabled = true;

  const profile = readProfileFromForm();

  // Basit doğrulama (görev 6'da daha kapsamlı uyarı eklenecek)
  if (
    profile.obp === null ||
    profile.tytNet === null ||
    profile.aytNet === null ||
    !profile.hobiler ||
    !profile.ruhHali ||
    !profile.sinif ||
    !profile.sehirTercihi
  ) {
    setStatus("Lütfen tüm alanları doldurun", "ok");
    els.startBtn.disabled = false;
    return;
  }

  els.dataEntryPage.classList.remove("is-active");
  setTimeout(() => {
    els.dataEntryPage.classList.add("hidden");
    els.resultsPage.classList.remove("hidden");
    setTimeout(() => {
      els.resultsPage.classList.add("is-active");
      startChat(profile);
    }, 50);
  }, 400);
});

els.chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.isChatStarted) return;

  const text = els.chatInput.value.trim();
  if (!text) return;

  addMessage({ author: "user", text });
  els.chatInput.value = "";
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
    addMessage({
      author: "bot",
      text: `Sohbet sırasında bir sorun oluştu: ${err?.message || "Bilinmeyen hata."}`,
    });
  } finally {
    setComposerEnabled(true);
    setStatus("Hazır", "ok");
    els.chatInput.focus();
  }
});

if (els.scrollToCardsBtn) {
  els.scrollToCardsBtn.addEventListener("click", () => {
    scrollPageToCards();
  });
}

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
    els.resultsPage.classList.remove("is-active");
    setTimeout(() => {
      els.resultsPage.classList.add("hidden");
      els.dataEntryPage.classList.remove("hidden");
      setTimeout(() => {
        els.dataEntryPage.classList.add("is-active");
        els.scrollToCardsBtn.classList.add("is-hidden");
        setStatus("Formu düzenleyin ve yeniden başlatın", "ok");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }, 400);
  });
}

// Initial UI state
setComposerEnabled(false);
setStatus("Hazır", "ok");
if (els.scrollToCardsBtn) els.scrollToCardsBtn.classList.add("is-hidden");
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


