"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seçin...",
  searchPlaceholder = "Axtar...",
  disabled,
  emptyText = "Nəticə tapılmadı.",
  error,
}: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyText?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) {
        onChange(filtered[activeIndex].value);
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400",
          error ? "border-red-400" : "border-gray-200"
        )}
      >
        <span className={cn(!selected && "text-gray-400", "truncate")}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && <div className="px-3.5 py-3 text-sm text-gray-400">{emptyText}</div>}
            {filtered.map((o, idx) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-primary-50",
                  idx === activeIndex && "bg-primary-50"
                )}
              >
                <span>
                  {o.label}
                  {o.sublabel && <span className="ml-1.5 text-xs text-gray-400">{o.sublabel}</span>}
                </span>
                {o.value === value && <Check className="h-4 w-4 text-primary-700" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
