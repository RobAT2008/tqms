import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EDUCATION_LEVEL_LABELS } from "@/lib/utils";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay() === 0 ? 7 : d.getDay(); // Bazar ertəsi=1
  d.setDate(d.getDate() - (day - 1));
  return d;
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const where = { isArchived: false };

  const [total, today, week, month, byLevel, byRegionRaw, byInstitutionRaw, byYearRaw] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfToday() } } }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfWeek() } } }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfMonth() } } }),
    prisma.student.groupBy({ by: ["educationLevel"], where, _count: true }),
    prisma.student.findMany({ where, select: { educationInstitution: { select: { region: { select: { name: true } } } } } }),
    prisma.student.groupBy({ by: ["educationInstitutionId"], where, _count: true, orderBy: { _count: { educationInstitutionId: "desc" } }, take: 10 }),
    prisma.student.groupBy({ by: ["graduationYear"], where, _count: true, orderBy: { graduationYear: "asc" } }),
  ]);

  const regionCounts: Record<string, number> = {};
  for (const s of byRegionRaw) {
    const name = s.educationInstitution.region.name;
    regionCounts[name] = (regionCounts[name] || 0) + 1;
  }

  const institutionIds = byInstitutionRaw.map((i) => i.educationInstitutionId);
  const institutions = await prisma.educationInstitution.findMany({ where: { id: { in: institutionIds } } });
  const instMap = new Map(institutions.map((i) => [i.id, i.name]));

  return NextResponse.json({
    total,
    today,
    week,
    month,
    byLevel: byLevel.map((l) => ({ level: EDUCATION_LEVEL_LABELS[l.educationLevel] || l.educationLevel, count: l._count })),
    byRegion: Object.entries(regionCounts).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count).slice(0, 15),
    byInstitution: byInstitutionRaw.map((i) => ({ institution: instMap.get(i.educationInstitutionId) || "—", count: i._count })),
    byYear: byYearRaw.map((y) => ({ year: y.graduationYear, count: y._count })),
  });
}
