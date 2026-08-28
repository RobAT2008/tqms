import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/admin/stat-card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Users, CalendarDays, CalendarRange, CalendarClock } from "lucide-react";
import { EDUCATION_LEVEL_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  return d;
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const where = { isArchived: false };
  const [total, today, week, month, byLevelRaw, byYearRaw, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfToday() } } }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfWeek() } } }),
    prisma.student.count({ where: { ...where, createdAt: { gte: startOfMonth() } } }),
    prisma.student.groupBy({ by: ["educationLevel"], where, _count: true }),
    prisma.student.groupBy({ by: ["graduationYear"], where, _count: true, orderBy: { graduationYear: "asc" } }),
    prisma.student.findMany({ where, select: { educationInstitutionId: true, educationInstitution: { select: { name: true, region: { select: { name: true } } } } } }),
  ]);

  const regionCounts: Record<string, number> = {};
  const instCounts: Record<string, number> = {};
  for (const s of students) {
    const rname = s.educationInstitution.region.name;
    regionCounts[rname] = (regionCounts[rname] || 0) + 1;
    const iname = s.educationInstitution.name;
    instCounts[iname] = (instCounts[iname] || 0) + 1;
  }

  const data = {
    byLevel: byLevelRaw.map((l) => ({ level: EDUCATION_LEVEL_LABELS[l.educationLevel] || l.educationLevel, count: l._count })),
    byRegion: Object.entries(regionCounts).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count).slice(0, 12),
    byYear: byYearRaw.map((y) => ({ year: y.graduationYear, count: y._count })),
    byInstitution: Object.entries(instCounts).map(([institution, count]) => ({ institution, count })).sort((a, b) => b.count - a.count).slice(0, 10),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Ümumi statistika və qeydiyyat göstəriciləri</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ümumi tələbə sayı" value={total} icon={Users} />
        <StatCard label="Bu gün qeydiyyat" value={today} icon={CalendarClock} />
        <StatCard label="Bu həftə qeydiyyat" value={week} icon={CalendarDays} />
        <StatCard label="Bu ay qeydiyyat" value={month} icon={CalendarRange} />
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Hələ heç bir qeydiyyat yoxdur.
        </div>
      ) : (
        <DashboardCharts data={data} />
      )}
    </div>
  );
}
