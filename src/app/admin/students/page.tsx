"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { EDUCATION_LEVEL_LABELS } from "@/lib/utils";

const LEVEL_OPTIONS = Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => ({ value, label }));

export default function StudentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [regionId, setRegionId] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetch("/api/regions").then((r) => r.json()).then((d) => setRegions(d.regions || []));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDir,
    });
    if (search) params.set("search", search);
    if (educationLevel) params.set("educationLevel", educationLevel);
    if (regionId) params.set("regionId", regionId);
    if (graduationYear) params.set("graduationYear", graduationYear);

    fetch(`/api/students?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, sortBy, sortDir, search, educationLevel, regionId, graduationYear]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function toggleSort(field: string) {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  function exportUrl(format: "xlsx" | "csv") {
    const params = new URLSearchParams({ format });
    if (search) params.set("search", search);
    if (educationLevel) params.set("educationLevel", educationLevel);
    if (regionId) params.set("regionId", regionId);
    if (graduationYear) params.set("graduationYear", graduationYear);
    return `/api/export?${params.toString()}`;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tələbələr</h1>
          <p className="text-sm text-gray-500">Cəmi {total} qeydiyyat</p>
        </div>
        <div className="flex gap-2">
          <a href={exportUrl("xlsx")} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 text-sm font-medium text-primary-700 hover:bg-primary-100">
            <Download className="h-4 w-4" /> Excel
          </a>
          <a href={exportUrl("csv")} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 text-sm font-medium text-primary-700 hover:bg-primary-100">
            <Download className="h-4 w-4" /> CSV
          </a>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Ad, soyad, FİN, telefon, ID"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
          <Select
            placeholder="Təhsil səviyyəsi"
            options={LEVEL_OPTIONS}
            value={educationLevel}
            onChange={(e) => { setPage(1); setEducationLevel(e.target.value); }}
          />
          <Select
            placeholder="Şəhər/rayon"
            options={regions.map((r: any) => ({ value: r.id, label: r.name }))}
            value={regionId}
            onChange={(e) => { setPage(1); setRegionId(e.target.value); }}
          />
          <Select
            placeholder="Bitirdiyi il"
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            value={graduationYear}
            onChange={(e) => { setPage(1); setGraduationYear(e.target.value); }}
          />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-400">Heç bir tələbə tapılmadı.</Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-400">
                  <th className="px-4 py-3">ID</th>
                  <SortableTh label="Ad" field="firstName" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <SortableTh label="Soyad" field="lastName" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <th className="px-4 py-3">Ata adı</th>
                  <th className="px-4 py-3">FİN</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Təhsil səviyyəsi</th>
                  <th className="px-4 py-3">Müəssisə</th>
                  <th className="px-4 py-3">Şəhər/rayon</th>
                  <SortableTh label="İl" field="graduationYear" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                  <SortableTh label="Tarix" field="createdAt" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-primary-50/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${s.id}`} className="font-medium text-primary-700 hover:underline">
                        {s.registrationCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{s.firstName}</td>
                    <td className="px-4 py-3">{s.lastName}</td>
                    <td className="px-4 py-3">{s.fatherName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.finMasked}</td>
                    <td className="px-4 py-3">{s.personalPhone}</td>
                    <td className="px-4 py-3">{EDUCATION_LEVEL_LABELS[s.educationLevel]}</td>
                    <td className="max-w-[180px] truncate px-4 py-3" title={s.institutionName}>{s.institutionName}</td>
                    <td className="px-4 py-3">{s.region}</td>
                    <td className="px-4 py-3">{s.graduationYear}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString("az-AZ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {items.map((s) => (
              <Link key={s.id} href={`/admin/students/${s.id}`}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-700">{s.firstName} {s.lastName}</span>
                    <span className="text-xs text-gray-400">{s.registrationCode}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{EDUCATION_LEVEL_LABELS[s.educationLevel]} · {s.institutionName}</p>
                  <p className="mt-1 text-xs text-gray-400">{s.region} · {s.graduationYear}</p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">Səhifə {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Əvvəlki
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Növbəti <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortableTh({ label, field, sortBy, sortDir, onClick }: any) {
  return (
    <th className="cursor-pointer select-none px-4 py-3" onClick={() => onClick(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortBy === field ? "text-primary-700" : "text-gray-300"}`} />
      </span>
    </th>
  );
}
