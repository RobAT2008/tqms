"use client";

import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

// +994 XX XXX XX XX formatında avtomatik mask
function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("994")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = "+994";
  if (digits.length > 0) out += " " + digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 7);
  if (digits.length > 7) out += " " + digits.slice(7, 9);
  return out;
}

export const PhoneInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: string; onValueChange: (v: string) => void }>(
  ({ error, onValueChange, value, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        {...props}
        error={error}
        value={(value as string) || "+994"}
        placeholder="+994 XX XXX XX XX"
        inputMode="numeric"
        onChange={(e) => onValueChange(formatPhoneInput(e.target.value))}
        onFocus={(e) => {
          if (!value) onValueChange("+994 ");
        }}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";
