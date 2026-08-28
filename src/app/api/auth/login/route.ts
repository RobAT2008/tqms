import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations";
import { verifyAdminCredentials, createSession } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`login:${getClientKey(req)}`, 10, 15 * 60_000);
  if (!rl.success) {
    return NextResponse.json({ message: "Çox sayda cəhd edildi. 15 dəqiqə sonra yenidən cəhd edin." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "E-mail və ya şifrə düzgün deyil." }, { status: 400 });
  }

  const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ message: "E-mail və ya şifrə yanlışdır." }, { status: 401 });
  }

  await createSession({ adminId: admin.id, email: admin.email, role: admin.role });
  return NextResponse.json({ ok: true, admin: { fullName: admin.fullName, role: admin.role } });
}
