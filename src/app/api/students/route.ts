import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fullStudentSchema } from "@/lib/validations";
import { generateRegistrationCode, maskFin } from "@/lib/utils";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

// Publik: yeni tələbə qeydiyyatı
export async function POST(req: Request) {
  const rl = rateLimit(`student-submit:${getClientKey(req)}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json({ message: "Çox sayda cəhd edildi. Bir qədər sonra yenidən cəhd edin." }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ message: "Yanlış sorğu." }, { status: 400 });

  // Client input formatını server schema formatına uyğunlaşdırırıq
  const payload = {
    firstName: raw.firstName,
    lastName: raw.lastName,
    fatherName: raw.fatherName,
    fin: raw.fin,
    birthDate: raw.birthDate,
    personalPhone: raw.personalPhone,
    father: raw.father,
    mother: raw.mother,
    relative: raw.relative,
    educationLevel: raw.educationLevel,
    regionId: raw.institutionRegionId,
    districtId: raw.institutionDistrictId || null,
    educationInstitutionId: raw.educationInstitutionId,
    graduationYear: raw.graduationYear,
    registrationAddress: raw.registrationAddress,
    actualAddress: raw.actualAddress,
    consentGiven: raw.consentGiven,
  };

  const parsed = fullStudentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Zəhmət olmasa bütün xanaları düzgün doldurun.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const finExists = await prisma.student.findUnique({ where: { fin: data.fin } });
  if (finExists) {
    return NextResponse.json({ message: "Bu FİN kodu ilə artıq qeydiyyat mövcuddur." }, { status: 409 });
  }

  const institution = await prisma.educationInstitution.findUnique({ where: { id: data.educationInstitutionId } });
  if (!institution || !institution.isActive) {
    return NextResponse.json({ message: "Seçilmiş təhsil müəssisəsi mövcud deyil." }, { status: 400 });
  }

  try {
    const student = await prisma.$transaction(async (tx) => {
      const father = await tx.parent.create({
        data: { fullName: data.father.fullName, phone: data.father.phone, workplace: data.father.workplace, relationType: "ata" },
      });
      const mother = await tx.parent.create({
        data: { fullName: data.mother.fullName, phone: data.mother.phone, workplace: data.mother.workplace, relationType: "ana" },
      });
      const relative = data.relative
        ? await tx.parent.create({
            data: { fullName: data.relative.fullName, phone: data.relative.phone, relationType: data.relative.relationType },
          })
        : null;

      const registrationAddress = await tx.address.create({
        data: {
          regionId: data.registrationAddress.regionId,
          districtId: data.registrationAddress.districtId || null,
          street: data.registrationAddress.street,
          building: data.registrationAddress.building,
        },
      });
      const actualAddress = await tx.address.create({
        data: {
          regionId: data.actualAddress.regionId,
          districtId: data.actualAddress.districtId || null,
          street: data.actualAddress.street,
          building: data.actualAddress.building,
        },
      });

      const year = new Date().getFullYear();
      const countThisYear = await tx.student.count({
        where: { registrationCode: { startsWith: `STU-${year}-` } },
      });
      const registrationCode = generateRegistrationCode(countThisYear + 1, year);

      return tx.student.create({
        data: {
          registrationCode,
          firstName: data.firstName,
          lastName: data.lastName,
          fatherName: data.fatherName,
          fin: data.fin,
          birthDate: new Date(data.birthDate),
          personalPhone: data.personalPhone,
          fatherId: father.id,
          motherId: mother.id,
          relativeId: relative?.id,
          educationLevel: data.educationLevel,
          educationInstitutionId: data.educationInstitutionId,
          graduationYear: data.graduationYear,
          registrationAddressId: registrationAddress.id,
          actualAddressId: actualAddress.id,
          consentGiven: true,
          consentAt: new Date(),
        },
      });
    });

    return NextResponse.json({ registrationCode: student.registrationCode }, { status: 201 });
  } catch (err) {
    console.error("Student creation error:", err);
    return NextResponse.json({ message: "Məlumatları yadda saxlamaq mümkün olmadı. Bir qədər sonra yenidən cəhd edin." }, { status: 500 });
  }
}

// Admin: siyahı - search, filter, sort, pagination
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const educationLevel = searchParams.get("educationLevel");
  const regionId = searchParams.get("regionId");
  const educationInstitutionId = searchParams.get("educationInstitutionId");
  const graduationYear = searchParams.get("graduationYear");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 20));

  const where: any = { isArchived: false };
  if (educationLevel) where.educationLevel = educationLevel;
  if (educationInstitutionId) where.educationInstitutionId = educationInstitutionId;
  if (graduationYear) where.graduationYear = Number(graduationYear);
  if (regionId) where.educationInstitution = { regionId };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { fin: { contains: search.toUpperCase(), mode: "insensitive" } },
      { personalPhone: { contains: search } },
      { registrationCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { educationInstitution: { include: { region: true, district: true } } },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  const items = students.map((s) => ({
    id: s.id,
    registrationCode: s.registrationCode,
    firstName: s.firstName,
    lastName: s.lastName,
    fatherName: s.fatherName,
    finMasked: maskFin(s.fin),
    personalPhone: s.personalPhone,
    educationLevel: s.educationLevel,
    institutionName: s.educationInstitution.name,
    region: s.educationInstitution.region.name,
    graduationYear: s.graduationYear,
    createdAt: s.createdAt,
  }));

  return NextResponse.json({ items, total, page, pageSize });
}
