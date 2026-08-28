"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Eye, EyeOff, Archive } from "lucide-react";
import Link from "next/link";
import { EDUCATION_LEVEL_LABELS, INSTITUTION_TYPE_LABELS } from "@/lib/utils";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  function load() {
    setLoading(true);
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setStudent(d.student);
        setForm({
          firstName: d.student?.firstName,
          lastName: d.student?.lastName,
          fatherName: d.student?.fatherName,
          personalPhone: d.student?.personalPhone,
          graduationYear: d.student?.graduationYear,
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      load();
    }
  }

  async function handleArchive() {
    if (!confirm("Bu tələbəni arxivləşdirmək istədiyinizə əminsiniz?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    router.push("/admin/students");
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 w-full" /></div>;
  if (!student) return <p className="text-sm text-gray-400">Tələbə tapılmadı.</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" /> Tələbələr siyahısına qayıt
        </Link>
        <div className="flex gap-2">
          {!editing ? (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Redaktə et
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Ləğv et</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Yadda saxlanılır..." : "Yadda saxla"}</Button>
            </>
          )}
          <Button size="sm" variant="danger" onClick={handleArchive}><Archive className="h-4 w-4" /> Arxivləşdir</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
        <Badge>{student.registrationCode}</Badge>
      </div>

      {editing ? (
        <Card className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div><Label>Ad</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
          <div><Label>Soyad</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          <div><Label>Ata adı</Label><Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} /></div>
          <div><Label>Şəxsi telefon</Label><Input value={form.personalPhone} onChange={(e) => setForm({ ...form, personalPhone: e.target.value })} /></div>
          <div><Label>Bitirdiyi il</Label><Input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} /></div>
        </Card>
      ) : (
        <>
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary-700">Şəxsi məlumatlar</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Ad" value={student.firstName} />
              <Field label="Soyad" value={student.lastName} />
              <Field label="Ata adı" value={student.fatherName} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">FİN</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">{showFin ? student.fin : "X".repeat(student.fin.length - 1) + student.fin.slice(-1)}</span>
                  <button onClick={() => setShowFin((s) => !s)} className="text-gray-400 hover:text-primary-700">
                    {showFin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Field label="Doğum tarixi" value={new Date(student.birthDate).toLocaleDateString("az-AZ")} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary-700">Əlaqə</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Şəxsi telefon" value={student.personalPhone} />
              <Field label="Ata telefon" value={student.father?.phone} />
              <Field label="Ana telefon" value={student.mother?.phone} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary-700">Valideynlər</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ata" value={`${student.father?.fullName} · ${student.father?.workplace || "—"}`} />
              <Field label="Ana" value={`${student.mother?.fullName} · ${student.mother?.workplace || "—"}`} />
              {student.relative && <Field label={`Yaxın qohum (${student.relative.relationType})`} value={`${student.relative.fullName} · ${student.relative.phone}`} />}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary-700">Təhsil</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Təhsil səviyyəsi" value={EDUCATION_LEVEL_LABELS[student.educationLevel]} />
              <Field label="Müəssisə" value={student.educationInstitution?.name} />
              <Field label="Müəssisənin növü" value={INSTITUTION_TYPE_LABELS[student.educationInstitution?.type]} />
              <Field label="Şəhər" value={student.educationInstitution?.region?.name} />
              <Field label="Rayon" value={student.educationInstitution?.district?.name} />
              <Field label="Ünvan" value={student.educationInstitution?.address} />
              <Field label="Bitirdiyi il" value={student.graduationYear} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary-700">Ünvan</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500">Qeydiyyat ünvanı</p>
                <Field label="Şəhər/rayon" value={student.registrationAddress?.region?.name} />
                <Field label="Rayon" value={student.registrationAddress?.district?.name} />
                <Field label="Küçə" value={student.registrationAddress?.street} />
                <Field label="Ev/bina/mənzil" value={student.registrationAddress?.building} />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500">Faktiki ünvan</p>
                <Field label="Şəhər/rayon" value={student.actualAddress?.region?.name} />
                <Field label="Rayon" value={student.actualAddress?.district?.name} />
                <Field label="Küçə" value={student.actualAddress?.street} />
                <Field label="Ev/bina/mənzil" value={student.actualAddress?.building} />
              </div>
            </div>
          </Card>

          {student.auditLogs?.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-primary-700">Dəyişiklik tarixçəsi</h2>
              <div className="space-y-2">
                {student.auditLogs.map((log: any) => (
                  <div key={log.id} className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{log.admin?.fullName}</span> — {log.action} —{" "}
                    {new Date(log.createdAt).toLocaleString("az-AZ")}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
