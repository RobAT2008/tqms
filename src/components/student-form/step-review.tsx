"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { WizardFormData, RegionOption } from "./types";
import { EDUCATION_LEVEL_LABELS } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-50 py-2 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value || "—"}</span>
    </div>
  );
}

export function StepReview({
  form,
  regions,
  institutionLabel,
}: {
  form: UseFormReturn<WizardFormData>;
  regions: RegionOption[];
  institutionLabel: string;
}) {
  const { watch, control, formState: { errors } } = form;
  const v = watch();

  const regionName = (id: string) => regions.find((r) => r.id === id)?.name || "";
  const districtName = (regionId: string, districtId: string) =>
    regions.find((r) => r.id === regionId)?.districts.find((d) => d.id === districtId)?.name || "";

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-primary-800">Məlumatlarınızı yoxlayın</h3>

      <Card className="p-5">
        <h4 className="mb-2 text-sm font-semibold text-primary-700">Şəxsi məlumatlar</h4>
        <Row label="Ad" value={v.firstName} />
        <Row label="Soyad" value={v.lastName} />
        <Row label="Ata adı" value={v.fatherName} />
        <Row label="FİN" value={v.fin} />
        <Row label="Doğum tarixi" value={v.birthDate} />
        <Row label="Şəxsi telefon" value={v.personalPhone} />
      </Card>

      <Card className="p-5">
        <h4 className="mb-2 text-sm font-semibold text-primary-700">Əlaqə məlumatları</h4>
        <Row label="Ata" value={`${v.father?.fullName} · ${v.father?.phone}`} />
        <Row label="Ana" value={`${v.mother?.fullName} · ${v.mother?.phone}`} />
        <Row label="Yaxın qohum" value={`${v.relative?.fullName} · ${v.relative?.phone} (${v.relative?.relationType})`} />
      </Card>

      <Card className="p-5">
        <h4 className="mb-2 text-sm font-semibold text-primary-700">Ünvan</h4>
        <Row
          label="Qeydiyyat ünvanı"
          value={`${regionName(v.registrationAddress?.regionId)}${v.registrationAddress?.districtId ? ", " + districtName(v.registrationAddress.regionId, v.registrationAddress.districtId) : ""}, ${v.registrationAddress?.street}, ${v.registrationAddress?.building}`}
        />
        <Row
          label="Faktiki ünvan"
          value={`${regionName(v.actualAddress?.regionId)}${v.actualAddress?.districtId ? ", " + districtName(v.actualAddress.regionId, v.actualAddress.districtId) : ""}, ${v.actualAddress?.street}, ${v.actualAddress?.building}`}
        />
      </Card>

      <Card className="p-5">
        <h4 className="mb-2 text-sm font-semibold text-primary-700">Təhsil</h4>
        <Row label="Təhsil səviyyəsi" value={EDUCATION_LEVEL_LABELS[v.educationLevel]} />
        <Row label="Təhsil müəssisəsi" value={institutionLabel} />
        <Row label="Bitirdiyi il" value={v.graduationYear} />
      </Card>

      <Card className="p-5">
        <label className="flex cursor-pointer items-start gap-2.5">
          <Controller
            control={control}
            name="consentGiven"
            render={({ field }) => <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          />
          <span className="text-sm text-gray-600">
            Şəxsi məlumatlarımın universitet tərəfindən tələbə qeydiyyatı və inzibati məqsədlərlə emal edilməsinə razıyam.
          </span>
        </label>
        <FieldError message={errors.consentGiven?.message as string | undefined} />
      </Card>
    </div>
  );
}
