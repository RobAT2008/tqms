import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tələbə üçün unikal qeydiyyat ID-si: STU-YYYY-000123
export function generateRegistrationCode(sequence: number, year = new Date().getFullYear()) {
  return `STU-${year}-${String(sequence).padStart(6, "0")}`;
}

// FİN kodunu maskalayır: yalnız son simvolu göstərir, digərlərini X ilə əvəz edir
export function maskFin(fin: string) {
  if (!fin || fin.length < 2) return "XXXXXXX";
  return "X".repeat(fin.length - 1) + fin.slice(-1);
}

// Telefonu maskalamadan formatlaşdırır (+994 XX XXX XX XX)
export function formatAzPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^994/, "");
  const p = digits.padEnd(9, "_");
  return `+994 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)}`.replace(/_/g, "");
}

export const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  TAM_ORTA_MEKTEB: "Tam orta məktəb",
  UMUMI_ORTA_MEKTEB: "Ümumi orta məktəb",
  KOLLEC: "Kollec",
  PESE_MEKTEBI: "Peşə məktəbi",
  PESE_LISEYI: "Peşə liseyi",
  PESE_TEHSIL_MERKEZI: "Peşə təhsil mərkəzi",
};

export const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  TAM_ORTA_MEKTEB: "Tam orta məktəb",
  GIMNAZIYA: "Gimnaziya",
  LISEY: "Lisey",
  PESE_MEKTEBI: "Peşə məktəbi",
  PESE_LISEYI: "Peşə liseyi",
  PESE_TEHSIL_MERKEZI: "Peşə təhsil mərkəzi",
  KOLLEC: "Kollec",
  TEXNIKUM: "Texnikum",
};

export const INSTITUTION_CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "Ümumi təhsil müəssisələri",
  VET: "Peşə təhsili müəssisələri",
  SPECIAL: "Orta ixtisas təhsili müəssisələri",
};

// Təhsil səviyyəsindən uyğun müəssisə tiplərinə map
export const LEVEL_TO_INSTITUTION_TYPES: Record<string, string[]> = {
  TAM_ORTA_MEKTEB: ["TAM_ORTA_MEKTEB", "GIMNAZIYA", "LISEY"],
  UMUMI_ORTA_MEKTEB: ["TAM_ORTA_MEKTEB", "GIMNAZIYA", "LISEY"],
  KOLLEC: ["KOLLEC", "TEXNIKUM"],
  PESE_MEKTEBI: ["PESE_MEKTEBI"],
  PESE_LISEYI: ["PESE_LISEYI"],
  PESE_TEHSIL_MERKEZI: ["PESE_TEHSIL_MERKEZI"],
};

export function graduationYearOptions(range = 60) {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - range; y--) years.push(y);
  return years;
}
