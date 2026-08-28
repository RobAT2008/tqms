import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn("mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-400", className)}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
