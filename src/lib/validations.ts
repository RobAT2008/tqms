import { z } from "zod";

// Azərbaycan FİN kodu: 7 simvol, rəqəm və böyük latın hərfləri
const finRegex = /^[A-Z0-9]{7}$/;

// +994 XX XXX XX XX formatı üçün (rəqəmləri təmizləyib yoxlayırıq)
export const azPhoneSchema = z
  .string()
  .min(1, "Bu xana doldurulmalıdır.")
  .refine((val) => {
    const digits = val.replace(/\D/g, "");
    const normalized = digits.startsWith("994") ? digits.slice(3) : digits;
    return /^(10|12|50|51|55|60|70|77|99)\d{7}$/.test(normalized);
  }, "Telefon nömrəsi düzgün formatda deyil. Nümunə: +994 50 123 45 67");

export const finSchema = z
  .string()
  .min(1, "Bu xana doldurulmalıdır.")
  .transform((v) => v.toUpperCase())
  .refine((v) => finRegex.test(v), "FİN kod düzgün daxil edilməyib.");

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 simvol olmalıdır.").max(50),
  lastName: z.string().min(2, "Soyad ən azı 2 simvol olmalıdır.").max(50),
  fatherName: z.string().min(2, "Ata adı ən azı 2 simvol olmalıdır.").max(50),
  fin: finSchema,
  birthDate: z.string().min(1, "Doğum tarixi seçilməlidir."),
  personalPhone: azPhoneSchema,
});

export const parentSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad ən azı 2 simvol olmalıdır."),
  phone: azPhoneSchema,
  workplace: z.string().optional().default(""),
});

export const relativeSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad ən azı 2 simvol olmalıdır."),
  phone: azPhoneSchema,
  relationType: z.string().min(1, "Qohumluq əlaqəsi qeyd edilməlidir."),
});

export const contactInfoSchema = z.object({
  father: parentSchema,
  mother: parentSchema,
  relative: relativeSchema.optional(),
});

export const EDUCATION_LEVELS = [
  "TAM_ORTA_MEKTEB",
  "UMUMI_ORTA_MEKTEB",
  "KOLLEC",
  "PESE_MEKTEBI",
  "PESE_LISEYI",
  "PESE_TEHSIL_MERKEZI",
] as const;

export const educationInfoSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVELS, { required_error: "Təhsil səviyyəsi seçilməlidir." }),
  regionId: z.string().min(1, "Şəhər/rayon seçilməlidir."),
  districtId: z.string().optional().nullable(),
  educationInstitutionId: z.string().min(1, "Təhsil müəssisəsi seçilməlidir."),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1980, "Bitirdiyi il düzgün deyil.")
    .max(new Date().getFullYear(), "Gələcək il seçilə bilməz."),
});

export const addressSchema = z.object({
  regionId: z.string().min(1, "Şəhər/rayon seçilməlidir."),
  districtId: z.string().optional().nullable(),
  street: z.string().min(1, "Bu xana doldurulmalıdır."),
  building: z.string().min(1, "Bu xana doldurulmalıdır."),
});

export const addressesSchema = z.object({
  registrationAddress: addressSchema,
  actualAddress: addressSchema,
  sameAsRegistration: z.boolean().optional().default(false),
});

export const consentSchema = z.object({
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Davam etmək üçün razılıq verilməlidir." }),
  }),
});

// Formun bütün mərhələlərini birləşdirən tam schema (server-side son yoxlama üçün)
export const fullStudentSchema = personalInfoSchema
  .merge(z.object({ father: parentSchema, mother: parentSchema, relative: relativeSchema.optional() }))
  .merge(educationInfoSchema)
  .merge(
    z.object({
      registrationAddress: addressSchema,
      actualAddress: addressSchema,
    })
  )
  .merge(consentSchema);

export type FullStudentInput = z.infer<typeof fullStudentSchema>;

// Admin login
export const adminLoginSchema = z.object({
  email: z.string().min(1, "E-mail daxil edilməlidir.").email("E-mail formatı düzgün deyil."),
  password: z.string().min(1, "Şifrə daxil edilməlidir."),
});

// Admin tərəfindən tələbə redaktəsi (bütün sahələr optional - partial update)
export const studentUpdateSchema = fullStudentSchema.partial();

// Təhsil müəssisəsi admin CRUD
export const institutionSchema = z.object({
  name: z.string().min(2, "Ad ən azı 2 simvol olmalıdır."),
  type: z.enum([
    "TAM_ORTA_MEKTEB",
    "GIMNAZIYA",
    "LISEY",
    "PESE_MEKTEBI",
    "PESE_LISEYI",
    "PESE_TEHSIL_MERKEZI",
    "KOLLEC",
    "TEXNIKUM",
  ]),
  category: z.enum(["GENERAL", "VET", "SPECIAL"]),
  regionId: z.string().min(1),
  districtId: z.string().optional().nullable(),
  address: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});
