import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";
import { EDUCATION_LEVEL_LABELS } from "@/lib/utils";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const search = searchParams.get("search")?.trim();
  const educationLevel = searchParams.get("educationLevel");
  const regionId = searchParams.get("regionId");
  const educationInstitutionId = searchParams.get("educationInstitutionId");
  const graduationYear = searchParams.get("graduationYear");

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

  const students = await prisma.student.findMany({
    where,
    include: { educationInstitution: { include: { region: true, district: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = students.map((s) => ({
    "Qeydiyyat ID": s.registrationCode,
    "Ad": s.firstName,
    "Soyad": s.lastName,
    "Ata adı": s.fatherName,
    "FİN": s.fin,
    "Şəxsi telefon": s.personalPhone,
    "Təhsil səviyyəsi": EDUCATION_LEVEL_LABELS[s.educationLevel] || s.educationLevel,
    "Təhsil müəssisəsi": s.educationInstitution.name,
    "Şəhər/rayon": s.educationInstitution.region.name,
    "Bitirdiyi il": s.graduationYear,
    "Qeydiyyat tarixi": s.createdAt.toISOString().slice(0, 10),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const filename = `telebeler_${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tələbələr");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
