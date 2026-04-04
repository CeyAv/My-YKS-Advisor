export type PuanTuru = "TYT" | "EA" | "SAY" | "SÖZ" | "DİL";
export type UniTuru = "DEVLET" | "VAKIF" | "HEPSI";
export type Seviye = "lisans" | "önlisans" | "hepsi";

export interface Program {
  kod: string;
  uniTuru: string;
  uniAdi: string;
  fakulte: string;
  programAdi: string;
  puanTuru: string;
  kontenjan: number | null;
  yerlesen: number | null;
  enKucukPuan: number | null;
  enBuyukPuan: number | null;
  sehir: string;
  seviye: "lisans" | "önlisans";
}

export interface StudentProfile {
  sinif: string;
  puanTuru: PuanTuru;
  puan: number;
  sehirTercihi: string;
  uniTuruTercihi: UniTuru;
  seviyeTercihi: Seviye;
  ilgiAlanlari: string;
  hedefler: string;
}

export interface FilterRequest {
  profile: StudentProfile;
}

export interface FilterResult {
  programs: Program[];
  totalFound: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  profile: StudentProfile;
  filteredPrograms: Program[];
}
