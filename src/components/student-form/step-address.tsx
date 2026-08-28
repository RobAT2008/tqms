"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { WizardFormData, RegionOption } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Card } from "@/components/ui/card";

function AddressBlock({
  form,
  prefix,
  title,
  regions,
  disabled,
}: {
  form: UseFormReturn<WizardFormData>;
  prefix: "registrationAddress" | "actualAddress";
  title: string;
  regions: RegionOption[];
  disabled?: boolean;
}) {
  const { register, control, watch, formState: { errors } } = form;
  const regionId = watch(`${prefix}.regionId`);
  const region = regions.find((r) => r.id === regionId);
  const hasDistricts = (region?.districts.length ?? 0) > 0;
  const err = errors[prefix];

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-semibold text-primary-800">{title}</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label required>Şəhər / rayon</Label>
          <Select
            {...register(`${prefix}.regionId`)}
            disabled={disabled}
            placeholder="Şəhər / Rayon seçin"
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            error={err?.regionId?.message as string | undefined}
          />
          <FieldError message={err?.regionId?.message as string | undefined} />
        </div>
        {hasDistricts && (
          <div>
            <Label>Rayon (Bakı/Gəncə üçün)</Label>
            <Select
              {...register(`${prefix}.districtId`)}
              disabled={disabled}
              placeholder="Rayon seçin"
              options={region!.districts.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>
        )}
        <div>
          <Label required>Küçə / prospekt / qəsəbə / kənd</Label>
          <Input
            {...register(`${prefix}.street`)}
            disabled={disabled || !regionId}
            placeholder={!regionId ? "Əvvəlcə şəhər/rayon seçin" : "Nizami küçəsi 45"}
            error={err?.street?.message as string | undefined}
          />
          <FieldError message={err?.street?.message as string | undefined} />
        </div>
        <div>
          <Label required>Ev / bina / mənzil</Label>
          <Input
            {...register(`${prefix}.building`)}
            disabled={disabled || !regionId}
            placeholder={!regionId ? "Əvvəlcə şəhər/rayon seçin" : "12/45"}
            error={err?.building?.message as string | undefined}
          />
          <FieldError message={err?.building?.message as string | undefined} />
        </div>
      </div>
    </Card>
  );
}

export function StepAddress({ form, regions }: { form: UseFormReturn<WizardFormData>; regions: RegionOption[] }) {
  const { control, watch, setValue } = form;
  const sameAsRegistration = watch("sameAsRegistration");
  const registrationAddress = watch("registrationAddress");

  return (
    <div className="space-y-6">
      <AddressBlock form={form} prefix="registrationAddress" title="Qeydiyyat ünvanı" regions={regions} />

      <label className="flex cursor-pointer items-start gap-2 px-1">
        <Controller
          control={control}
          name="sameAsRegistration"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onChange={(e) => {
                field.onChange(e.target.checked);
                if (e.target.checked) {
                  setValue("actualAddress", { ...registrationAddress });
                }
              }}
            />
          )}
        />
        <span className="text-sm text-gray-600">Faktiki yaşadığım ünvan qeydiyyat ünvanı ilə eynidir</span>
      </label>

      <AddressBlock
        form={form}
        prefix="actualAddress"
        title="Faktiki yaşadığı ünvan"
        regions={regions}
        disabled={sameAsRegistration}
      />
    </div>
  );
}
