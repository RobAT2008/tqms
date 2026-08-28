"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { WizardFormData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { PhoneInput } from "./phone-input";

export function StepPersonal({ form }: { form: UseFormReturn<WizardFormData> }) {
  const { register, control, formState: { errors } } = form;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Label required>Ad</Label>
        <Input {...register("firstName")} error={errors.firstName?.message} placeholder="Aydın" />
        <FieldError message={errors.firstName?.message} />
      </div>
      <div>
        <Label required>Soyad</Label>
        <Input {...register("lastName")} error={errors.lastName?.message} placeholder="Abasov" />
        <FieldError message={errors.lastName?.message} />
      </div>
      <div>
        <Label required>Ata adı</Label>
        <Input {...register("fatherName")} error={errors.fatherName?.message} placeholder="Elşən" />
        <FieldError message={errors.fatherName?.message} />
      </div>
      <div>
        <Label required>FİN kod</Label>
        <Input {...register("fin")} error={errors.fin?.message} placeholder="AAAA1A1" maxLength={7} className="uppercase" />
        <FieldError message={errors.fin?.message} />
      </div>
      <div>
        <Label required>Doğum tarixi</Label>
        <Input type="date" {...register("birthDate")} error={errors.birthDate?.message} max={new Date().toISOString().slice(0, 10)} />
        <FieldError message={errors.birthDate?.message} />
      </div>
      <div>
        <Label required>Şəxsi mobil nömrə</Label>
        <Controller
          control={control}
          name="personalPhone"
          render={({ field }) => (
            <PhoneInput value={field.value} onValueChange={field.onChange} error={errors.personalPhone?.message} />
          )}
        />
        <FieldError message={errors.personalPhone?.message} />
      </div>
    </div>
  );
}
