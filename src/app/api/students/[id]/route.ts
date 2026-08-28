import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      father: true,
      mother: true,
      relative: true,
      educationInstitution: { include: { region: true, district: true } },
      registrationAddress: { include: { region: true, district: true } },
      actualAddress: { include: { region: true, district: true } },
      auditLogs: { include: { admin: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return NextResponse.json({ message: "Tələbə tapılmadı." }, { status: 404 });
  return NextResponse.json({ student });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const existing = await prisma.student.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: "Tələbə tapılmadı." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Yanlış sorğu." }, { status: 400 });

  // Sadə skalyar sahələr üçün partial update (ad, soyad, telefon, il və s.)
  const allowedFields = [
    "firstName",
    "lastName",
    "fatherName",
    "personalPhone",
    "educationLevel",
    "educationInstitutionId",
    "graduationYear",
  ];
  const updateData: Record<string, any> = {};
  const changes: Record<string, { old: any; new: any }> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== (existing as any)[field]) {
      changes[field] = { old: (existing as any)[field], new: body[field] };
      updateData[field] = field === "graduationYear" ? Number(body[field]) : body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ student: existing, message: "Dəyişiklik aşkarlanmadı." });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.student.update({ where: { id: params.id }, data: updateData });
    await tx.auditLog.create({
      data: {
        studentId: params.id,
        adminId: admin.id,
        action: "UPDATE",
        changes,
      },
    });
    return s;
  });

  return NextResponse.json({ student: updated });
}

// Arxivləşdirmə (soft delete) - audit log ilə
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const existing = await prisma.student.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ message: "Tələbə tapılmadı." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.student.update({ where: { id: params.id }, data: { isArchived: true } });
    await tx.auditLog.create({
      data: {
        studentId: params.id,
        adminId: admin.id,
        action: "ARCHIVE",
        changes: { isArchived: { old: false, new: true } },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
