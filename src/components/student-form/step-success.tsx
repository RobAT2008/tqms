"use client";

import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StepSuccess({ registrationCode }: { registrationCode: string }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
      <CheckCircle2 className="h-16 w-16 text-accent" />
      <h2 className="text-xl font-semibold text-gray-900">Qeydiyyatınız uğurla tamamlandı.</h2>
      <p className="max-w-md text-sm text-gray-500">
        Məlumatlarınız uğurla qəbul edildi. Aşağıdakı unikal qeydiyyat nömrənizi qeyd edin — zəruri hallarda bu nömrə ilə müraciət edə bilərsiniz.
      </p>
      <div className="mt-2 rounded-xl bg-primary-50 px-6 py-3 text-lg font-bold tracking-wide text-primary-800">
        {registrationCode}
      </div>
    </Card>
  );
}
