import { Program, StudentProfile } from "@/types";
import programsData from "@/data/programs.json";

const ALL_PROGRAMS: Program[] = programsData as Program[];

export function filterPrograms(profile: StudentProfile): Program[] {
  const { puanTuru, puan, sehirTercihi, uniTuruTercihi, seviyeTercihi } =
    profile;

  return ALL_PROGRAMS.filter((p) => {
    // Must have a valid minimum score
    if (p.enKucukPuan === null) return false;

    // Score type must match
    if (p.puanTuru !== puanTuru) return false;

    // Student score must be >= minimum score for the program
    if (puan < p.enKucukPuan) return false;

    // City filter (if specified)
    if (sehirTercihi && sehirTercihi.trim() !== "") {
      const cityQuery = sehirTercihi.trim().toUpperCase();
      if (!p.sehir.toUpperCase().includes(cityQuery)) return false;
    }

    // University type filter
    if (uniTuruTercihi !== "HEPSI") {
      if (p.uniTuru !== uniTuruTercihi) return false;
    }

    // Education level filter
    if (seviyeTercihi !== "hepsi") {
      if (p.seviye !== seviyeTercihi) return false;
    }

    return true;
  });
}
