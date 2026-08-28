import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { institutionSchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const body = await req.json();
  const parsed = institutionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Məlumatlar düzgün deyil.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const institution = await prisma.educationInstitution.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      districtId: parsed.data.districtId === undefined ? undefined : parsed.data.districtId || null,
    },
  });

  return NextResponse.json({ institution });
}

// Deaktiv etmə (soft delete) - əvvəlki tələbə qeydləri qorunur
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "İcazə yoxdur." }, { status: 401 });

  const institution = await prisma.educationInstitution.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ institution });
}
