import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400",
        error ? "border-red-400" : "border-gray-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
