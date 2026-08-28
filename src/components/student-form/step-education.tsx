"use client";

import { useEffect, useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { WizardFormData, RegionOption } from "./types";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { FieldError } from "@/components/ui/field-error";
import { EDUCATION_LEVEL_LABELS, INSTITUTION_TYPE_LABELS, graduationYearOptions } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const LEVEL_OPTIONS = Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => ({ value, label }));

export function StepEducation({ form, regions }: { form: UseFormReturn<WizardFormData>; regions: RegionOption[] }) {
  const { register, control, watch, setValue, formState: { errors } } = form;
  const level = watch("educationLevel");
  const regionId = watch("institutionRegionId");
  const districtId = watch("institutionDistrictId");

  const [institutions, setInstitutions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  const region = regions.find((r) => r.id === regionId);
  const hasDistricts = (region?.districts.length ?? 0) > 0;

  useEffect(() => {
    if (!level || !regionId) {
      setInstitutions([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ level, regionId });
    if (districtId) params.set("districtId", districtId);
    fetch(`/api/institutions?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setInstitutions(
          (data.institutions || []).map((i: any) => ({
            value: i.id,
            label: i.name,
            sublabel: `${INSTITUTION_TYPE_LABELS[i.type]} · ${i.region?.name ?? ""}${i.district ? " · " + i.district.name : ""}`,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [level, regionId, districtId]);

  const selectedInstitution = watch("educationInstitutionId");

  return (
    <div className="space-y-6">
      <div>
        <Label required>Bitirdiyi təhsil səviyyəsi</Label>
        <Select
          name="educationLevel"
          value={level}
          placeholder="Təhsil səviyyəsini seçin"
          options={LEVEL_OPTIONS}
          error={errors.educationLevel?.message}
          onChange={(e) => {
            setValue("educationLevel", e.target.value, { shouldValidate: true });
            setValue("educationInstitutionId", "");
          }}
        />
        <FieldError message={errors.educationLevel?.message} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label required>Müəssisənin yerləşdiyi şəhər / rayon</Label>
          <Select
            name="institutionRegionId"
            value={regionId}
            disabled={!level}
            placeholder={!level ? "Əvvəlcə təhsil səviyyəsini seçin" : "Şəhər / Rayon seçin"}
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(e) => {
              setValue("institutionRegionId", e.target.value);
              setValue("institutionDistrictId", "");
              setValue("educationInstitutionId", "");
            }}
          />
        </div>
        {hasDistricts && (
          <div>
            <Label>Rayon</Label>
            <Select
              name="institutionDistrictId"
              value={districtId}
              placeholder="Rayon seçin (istəyə bağlı)"
              options={region!.districts.map((d) => ({ value: d.id, label: d.name }))}
              onChange={(e) => {
                setValue("institutionDistrictId", e.target.value);
                setValue("educationInstitutionId", "");
              }}
            />
          </div>
        )}
      </div>

      <div>
        <Label required>Bitirdiyi təhsil müəssisəsi</Label>
        {loading ? (
          <Skeleton className="h-11 w-full" />
        ) : (
          <Controller
            control={control}
            name="educationInstitutionId"
            render={({ field }) => (
              <Combobox
                value={field.value}
                onChange={field.onChange}
                options={institutions}
                disabled={!level || !regionId}
                placeholder={!regionId ? "Əvvəlcə şəhər/rayon seçin" : "Müəssisəni axtarın və seçin"}
                searchPlaceholder="Məs. Bakı Texniki"
                emptyText={institutions.length === 0 ? "Bu şəhər/rayonda uyğun müəssisə tapılmadı." : "Nəticə tapılmadı."}
                error={errors.educationInstitutionId?.message}
              />
            )}
          />
        )}
        <FieldError message={errors.educationInstitutionId?.message} />
      </div>

      <div className="sm:w-1/2">
        <Label required>Bitirdiyi il</Label>
        <Select
          {...register("graduationYear")}
          placeholder="İl seçin"
          options={graduationYearOptions().map((y) => ({ value: String(y), label: String(y) }))}
          error={errors.graduationYear?.message as string | undefined}
        />
        <FieldError message={errors.graduationYear?.message as string | undefined} />
      </div>
    </div>
  );
}
