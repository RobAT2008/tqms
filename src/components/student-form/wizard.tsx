"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { WizardFormData, RegionOption, STEP_TITLES } from "./types";
import { StepPersonal } from "./step-personal";
import { StepContact } from "./step-contact";
import { StepAddress } from "./step-address";
import { StepEducation } from "./step-education";
import { StepReview } from "./step-review";
import { StepSuccess } from "./step-success";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEP_FIELDS: (keyof WizardFormData | string)[][] = [
  ["firstName", "lastName", "fatherName", "fin", "birthDate", "personalPhone"],
  ["father", "mother", "relative"],
  ["registrationAddress", "actualAddress"],
  ["educationLevel", "educationInstitutionId", "graduationYear"],
  ["consentGiven"],
];

const emptyAddress = { regionId: "", districtId: "", street: "", building: "" };

export function StudentRegistrationWizard() {
  const [step, setStep] = useState(0);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);
  const [institutionLabel, setInstitutionLabel] = useState("");

  const form = useForm<WizardFormData>({
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      fatherName: "",
      fin: "",
      birthDate: "",
      personalPhone: "",
      father: { fullName: "", phone: "", workplace: "" },
      mother: { fullName: "", phone: "", workplace: "" },
      relative: { fullName: "", phone: "", relationType: "" },
      registrationAddress: { ...emptyAddress },
      actualAddress: { ...emptyAddress },
      sameAsRegistration: false,
      educationLevel: "",
      institutionRegionId: "",
      institutionDistrictId: "",
      educationInstitutionId: "",
      graduationYear: "",
      consentGiven: false as any,
    },
  });

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((d) => setRegions(d.regions || []));
  }, []);

  // Seçilmiş müəssisənin adını yoxlama mərhələsi üçün saxla
  useEffect(() => {
    const sub = form.watch(async (values, { name }) => {
      if (name === "educationInstitutionId" && values.educationInstitutionId) {
        const res = await fetch(`/api/institutions?level=${values.educationLevel}&regionId=${values.institutionRegionId}`);
        const data = await res.json();
        const found = (data.institutions || []).find((i: any) => i.id === values.educationInstitutionId);
        if (found) setInstitutionLabel(found.name);
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  async function goNext() {
    const fields = STEP_FIELDS[step] as any;
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;
    if (step === 3) {
      // FİN/telefon vaxtı server-side unikal yoxlaması burada da edilə bilər (ön yoxlama)
    }
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const v = form.getValues();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || "Məlumatları yadda saxlamaq mümkün olmadı. Bir qədər sonra yenidən cəhd edin.");
        setSubmitting(false);
        return;
      }
      setRegistrationCode(data.registrationCode);
    } catch {
      setSubmitError("Məlumatları yadda saxlamaq mümkün olmadı. Bir qədər sonra yenidən cəhd edin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registrationCode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <StepSuccess registrationCode={registrationCode} />
      </div>
    );
  }

  const progressPct = ((step + 1) / STEP_TITLES.length) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary-800 sm:text-3xl">Tələbə Qeydiyyat Formu</h1>
        <p className="mt-1 text-sm text-gray-500">Zəhmət olmasa bütün mərhələləri diqqətlə doldurun.</p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
          {STEP_TITLES.map((title, idx) => (
            <span key={title} className={cn("hidden sm:block", idx === step && "text-primary-700 font-semibold")}>
              {idx + 1}. {title}
            </span>
          ))}
        </div>
        <Progress value={progressPct} />
        <p className="mt-2 text-center text-xs text-gray-400 sm:hidden">
          Mərhələ {step + 1} / {STEP_TITLES.length} — {STEP_TITLES[step]}
        </p>
      </div>

      <Card className="p-5 sm:p-8">
        {step === 0 && <StepPersonal form={form} />}
        {step === 1 && <StepContact form={form} />}
        {step === 2 && <StepAddress form={form} regions={regions} />}
        {step === 3 && <StepEducation form={form} regions={regions} />}
        {step === 4 && <StepReview form={form} regions={regions} institutionLabel={institutionLabel} />}

        {submitError && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0 || submitting}>
            Geri qayıt
          </Button>
          {step < STEP_TITLES.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Növbəti
            </Button>
          ) : (
            <Button type="button" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Göndərilir..." : "Təsdiq et və göndər"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
