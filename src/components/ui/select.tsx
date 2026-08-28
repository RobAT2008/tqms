import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption { value: string; label: string; }

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string; options: SelectOption[]; placeholder?: string }
>(({ className, error, options, placeholder, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400",
      error ? "border-red-400" : "border-gray-200",
      className
    )}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
));
Select.displayName = "Select";
