"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { WizardFormData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { PhoneInput } from "./phone-input";
import { Card } from "@/components/ui/card";

export function StepContact({ form }: { form: UseFormReturn<WizardFormData> }) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-primary-800">Ata</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <Label required>Ad Soyad</Label>
            <Input {...register("father.fullName")} error={errors.father?.fullName?.message} />
            <FieldError message={errors.father?.fullName?.message} />
          </div>
          <div>
            <Label required>Əlaqə nömrəsi</Label>
            <Controller
              control={control}
              name="father.phone"
              render={({ field }) => <PhoneInput value={field.value} onValueChange={field.onChange} error={errors.father?.phone?.message} />}
            />
            <FieldError message={errors.father?.phone?.message} />
          </div>
          <div>
            <Label>İş yeri / vəzifə</Label>
            <Input {...register("father.workplace")} />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-primary-800">Ana</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <Label required>Ad Soyad</Label>
            <Input {...register("mother.fullName")} error={errors.mother?.fullName?.message} />
            <FieldError message={errors.mother?.fullName?.message} />
          </div>
          <div>
            <Label required>Əlaqə nömrəsi</Label>
            <Controller
              control={control}
              name="mother.phone"
              render={({ field }) => <PhoneInput value={field.value} onValueChange={field.onChange} error={errors.mother?.phone?.message} />}
            />
            <FieldError message={errors.mother?.phone?.message} />
          </div>
          <div>
            <Label>İş yeri / vəzifə</Label>
            <Input {...register("mother.workplace")} />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-primary-800">Bakıda yaşayan yaxın qohum</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <Label required>Ad Soyad</Label>
            <Input {...register("relative.fullName")} error={errors.relative?.fullName?.message} />
            <FieldError message={errors.relative?.fullName?.message} />
          </div>
          <div>
            <Label required>Əlaqə nömrəsi</Label>
            <Controller
              control={control}
              name="relative.phone"
              render={({ field }) => <PhoneInput value={field.value} onValueChange={field.onChange} error={errors.relative?.phone?.message} />}
            />
            <FieldError message={errors.relative?.phone?.message} />
          </div>
          <div>
            <Label required>Qohumluq əlaqəsi</Label>
            <Input {...register("relative.relationType")} placeholder="Məs. dayı, xala, əmi" error={errors.relative?.relationType?.message} />
            <FieldError message={errors.relative?.relationType?.message} />
          </div>
        </div>
      </Card>
    </div>
  );
}
