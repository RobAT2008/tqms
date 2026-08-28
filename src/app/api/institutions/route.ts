import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { institutionSchema, EDUCATION_LEVELS } from "@/lib/validations";
import { LEVEL_TO_INSTITUTION_TYPES } from "@/lib/utils";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

// Publik: forma üçün səviyyə + şəhər/rayona görə filterlənmiş, aktiv müəssisələr.
// Admin: axtarış/filter/pagination ilə bütün (aktiv + deaktiv) müəssisələr.
export async function GET(req: Request) {
  const rl = rateLimit(`institutions:${getClientKey(req)}`, 60, 60_000);
  if (!rl.success) {
    return NextResponse.json({ message: "Çox sayda sorğu. Bir qədər sonra yenidən cəhd edin." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const regionId = searchParams.get("regionId");
  const districtId = searchParams.get("districtId");
  const q = searchParams.get("q");
  const adminMode = searchParams.get("admin") === "1";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 50));

  if (adminMode) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

    const where: any = {};
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (regionId) where.regionId = regionId;
    if (searchParams.get("type")) where.type = searchParams.get("type");
    if (searchParams.get("category")) where.category = searchParams.get("category");
    if (searchParams.get("active") === "true") where.isActive = true;
    if (searchParams.get("active") === "false") where.isActive = false;

    const [items, total] = await Promise.all([
      prisma.educationInstitution.findMany({
        where,
        include: { region: true, district: true },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.educationInstitution.count({ where }),
    ]);
    return NextResponse.json({ institutions: items, total, page, pageSize });
  }

  if (!level || !regionId || !EDUCATION_LEVELS.includes(level as any)) {
    return NextResponse.json({ institutions: [] });
  }

  const types = LEVEL_TO_INSTITUTION_TYPES[level] || [];
  const where: any = {
    isActive: true,
    regionId,
    type: { in: types },
  };
  if (districtId) where.districtId = districtId;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const institutions = await prisma.educationInstitution.findMany({
    where,
    include: { region: true, district: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  return NextResponse.json({ institutions });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const body = await req.json();
  const parsed = institutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Məlumatlar düzgün deyil.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.educationInstitution.findFirst({
    where: {
      name: parsed.data.name,
      type: parsed.data.type,
      regionId: parsed.data.regionId,
      districtId: parsed.data.districtId || null,
    },
  });
  if (existing) {
    return NextResponse.json({ message: "Bu müəssisə artıq bazada mövcuddur (ad, növ, şəhər/rayon eynidir)." }, { status: 409 });
  }

  const institution = await prisma.educationInstitution.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      category: parsed.data.category,
      regionId: parsed.data.regionId,
      districtId: parsed.data.districtId || null,
      address: parsed.data.address,
      source: "admin-panel",
      sourceUpdatedAt: new Date(),
    },
  });

  return NextResponse.json({ institution }, { status: 201 });
}
