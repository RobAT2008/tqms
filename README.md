# Tələbə Qeydiyyat Sistemi (TQMS)

Universitetə yeni qəbul olunan tələbələr üçün tam funksional, təhlükəsiz qeydiyyat sistemi.
Next.js (App Router) + TypeScript + PostgreSQL + Prisma əsasında qurulub, tamamilə Azərbaycan dilində.

## Funksionallıq

- **Tələbə Formu** — 5 mərhələli wizard (Şəxsi məlumatlar → Əlaqə → Ünvan → Təhsil → Yoxlama), irəli/geri naviqasiya, mərhələ arası məlumat itməsi yoxdur, mobil-uyğun.
- **Dinamik təhsil müəssisəsi seçimi** — təhsil səviyyəsi → şəhər/rayon → müəssisə (searchable combobox), server-side filterlənir.
- **Admin Panel** — login, dashboard (statistika + qrafiklər), tələbə siyahısı (axtarış/filter/sort/pagination + mobil kart görünüşü), tələbə detalı/redaktəsi + audit log, təhsil müəssisələri idarəetməsi (əlavə et/redaktə et/deaktiv et), Excel/CSV export (filterlə uyğun).
- **Təhlükəsizlik** — bcrypt password hashing, JWT-əsaslı httpOnly/secure session cookie, server-side Zod validation, sadə in-memory rate limiting (login və form submit üçün), FİN-in admin table-də maskalanması, security header-lər, SQL injection-a qarşı Prisma parametrli sorğular.

## Quraşdırma

### 1. Asılılıqları yükləyin
```bash
npm install
```

### 2. Mühit dəyişənləri
`.env.example` faylını `.env` kimi kopyalayın və dəyərləri doldurun:
```bash
cp .env.example .env
```
`DATABASE_URL` — işlək PostgreSQL bazasına işarə etməlidir (lokal, Docker və ya idarə olunan xidmət, məs. Neon/Supabase/RDS).
`JWT_SECRET` — production-da mütləq uzun, təsadüfi sətirlə əvəz edin.
`ADMIN_EMAIL` / `ADMIN_PASSWORD` — yalnız `seed` skripti ilə yaradılan ilkin demo admin üçün istifadə olunur; production-da güclü şifrə verin və seed-dən sonra dəyişdirin.

### 3. Database migrasiyası və seed
```bash
npx prisma migrate dev --name init
npm run seed
```
Bu, Azərbaycanın bütün şəhər/rayonlarını, nümunə təhsil müəssisələri toplusunu və demo admin istifadəçisini yaradacaq.

### 4. İşə salın
```bash
npm run dev
```
Tələbə formu: `http://localhost:3000`
Admin panel: `http://localhost:3000/admin/login`

### Production build
```bash
npm run build
npm start
```

## Layihə strukturu

```
prisma/
  schema.prisma        # bütün data modeli (Student, Parent, Address, EducationInstitution, Region, District, Admin, AuditLog)
  seed.ts               # regionlar, müəssisələr və demo admin üçün seed skripti
  data/
    regions.json         # Azərbaycanın şəhər/rayon siyahısı (Bakının 12 rayonu daxil)
    institutions.json    # təhsil müəssisələri idxal strukturu (aşağıya bax)
src/
  app/
    page.tsx                     # tələbə qeydiyyat formu (ana səhifə)
    admin/                       # admin panel səhifələri (login qorunmayıb, qalanı middleware ilə qorunur)
    api/                         # REST API route-ları (institutions, students, dashboard, export, auth)
  components/
    student-form/                # wizard-ın hər mərhələsi ayrıca komponentdir
    admin/                       # admin nav, dashboard qrafikləri, stat kartları
    ui/                          # təkrar istifadə olunan UI elementləri (Tailwind əsaslı, xarici UI kitabxanası tələb etmir)
  lib/
    prisma.ts, auth.ts, validations.ts, utils.ts, rate-limit.ts
  middleware.ts          # /admin/* route-larını sessiya olmadan bloklayır
```

## Təhsil müəssisələri məlumatı — VACİB QEYD

`prisma/data/institutions.json` faylı **nümunə** məlumat dəstidir: strukturun necə olduğunu göstərir və bir neçə real, rəsmi mənbədən (edu.gov.az) götürülmüş müəssisəni ehtiva edir (məs. Heydər Əliyev adına lisey, Bakı Texniki Kolleci və s., `source` sahəsində göstərilib).

Elm və Təhsil Nazirliyinin və Peşə Təhsili üzrə Dövlət Agentliyinin saytlarında minlərlə müəssisə var və onlar səhifələnmiş, JavaScript ilə render olunan siyahılar şəklindədir — bu mühitdən avtomatik tam scrape etmək mümkün olmadı. Sistemin idxal mexanizmi buna görə **JSON/CSV import** prinsipi üzərində qurulub:

1. Rəsmi mənbələrdən (aşağıda) siyahını əldə edin (əl ilə köçürmə, saytın öz export funksiyası, və ya icazə verilən bir scraping həlli ilə).
2. Məlumatı `prisma/data/institutions.json`-dakı formata salın:
   ```json
   {
     "name": "Bakı Texniki Kolleci",
     "type": "KOLLEC",
     "category": "SPECIAL",
     "region": "Bakı şəhəri",
     "district": "Nizami rayonu",
     "address": "Q. Qarayev küçəsi 2B",
     "source": "edu.gov.az",
     "sourceUpdatedAt": "2026-08-01"
   }
   ```
   `type` dəyərləri: `TAM_ORTA_MEKTEB, GIMNAZIYA, LISEY, PESE_MEKTEBI, PESE_LISEYI, PESE_TEHSIL_MERKEZI, KOLLEC, TEXNIKUM`.
   `category` dəyərləri: `GENERAL, VET, SPECIAL`.
3. `npm run seed` işlədin — skript `upsert` istifadə etdiyi üçün mövcud yazıları təkrarlamadan yeniləyir (ad+növ+şəhər/rayon kombinasiyasına görə).

Alternativ olaraq, admin panelin **Təhsil müəssisələri** bölməsindən tək-tək əlavə/redaktə/deaktiv etmək mümkündür — bu, tam idxaldan sonra kiçik düzəlişlər üçün nəzərdə tutulub.

**Rəsmi mənbələr:**
- Ümumi təhsil: https://edu.gov.az/umumitehsil-muessiselerinin-siyahisi
- Orta ixtisas təhsili: https://edu.gov.az/az/secondary-special-education/orta-ixtisas-tehsili-muessiselerinin-siyahisi
- Peşə təhsili: https://vet.edu.gov.az/educationInstitutions

Deaktiv edilmiş müəssisələr yeni tələbə formunda göstərilmir, lakin əvvəlki tələbə qeydlərində saxlanılır (`isActive: false`, silinmir).

## Database sxemi (qısaca)

`Region` → `District` → `Address` / `EducationInstitution`
`Student` → `Parent` (ata/ana/qohum), `EducationInstitution`, `Address` (qeydiyyat + faktiki)
`Admin` → `AuditLog` (tələbə redaktələrinin kim/nə/nə vaxt tarixçəsi)

İndekslər: `students.fin`, `students.lastName`, `students.personalPhone`, `students.educationInstitutionId`, `students.graduationYear`, `educationInstitutions.type/city(regionId)/district`.

## Təhlükəsizlik qeydləri

- Bütün admin API endpoint-ləri `requireAdmin()` ilə sessiya yoxlaması edir.
- FİN kodu admin table-də defolt maskalanıb göstərilir; tam görünüş yalnız detal səhifəsində "göz" ikonu ilə açılır.
- Login və tələbə form submit endpoint-ləri sadə in-memory rate limiter ilə qorunur. **Çoxlu server instansiyası ilə production deploymentdə** bunu Redis/Upstash əsaslı limiterlə əvəz edin.
- `.env` faylını heç vaxt repository-yə commit etməyin.
- HTTPS-i reverse proxy / hosting platforması səviyyəsində (məs. Vercel, Nginx + Let's Encrypt) təmin edin.

## Bilinən məhdudiyyətlər / Növbəti addımlar

- Təhsil müəssisələri bazası tam deyil — yuxarıdakı idxal təlimatına uyğun tamamlanmalıdır.
- Rate limiter in-memory-dir, çoxlu instansiyalı deploymentdə paylaşılmır.
- Audit log yalnız `firstName, lastName, fatherName, personalPhone, educationLevel, educationInstitutionId, graduationYear` sahələrini izləyir; tələb olunarsa ünvan/valideyn sahələri də əlavə edilə bilər.
