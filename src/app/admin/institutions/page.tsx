"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Power, X } from "lucide-react";
import { INSTITUTION_TYPE_LABELS, INSTITUTION_CATEGORY_LABELS } from "@/lib/utils";

const TYPE_BY_CATEGORY: Record<string, string[]> = {
  GENERAL: ["TAM_ORTA_MEKTEB", "GIMNAZIYA", "LISEY"],
  VET: ["PESE_MEKTEBI", "PESE_LISEYI", "PESE_TEHSIL_MERKEZI"],
  SPECIAL: ["KOLLEC", "TEXNIKUM"],
};

export default function InstitutionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [regionId, setRegionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "GENERAL", type: "TAM_ORTA_MEKTEB", regionId: "", districtId: "", address: "" });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/regions").then((r) => r.json()).then((d) => setRegions(d.regions || []));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ admin: "1", pageSize: "100" });
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (regionId) params.set("regionId", regionId);
    fetch(`/api/institutions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setItems(d.institutions || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [search, category, regionId]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDeactivate(id: string) {
    if (!confirm("Bu müəssisəni deaktiv etmək istədiyinizə əminsiniz? Yeni tələbə formunda görünməyəcək.")) return;
    await fetch(`/api/institutions/${id}`, { method: "DELETE" });
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const res = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.message || "Xəta baş verdi.");
      return;
    }
    setShowForm(false);
    setFormData({ name: "", category: "GENERAL", type: "TAM_ORTA_MEKTEB", regionId: "", districtId: "", address: "" });
    load();
  }

  const region = regions.find((r) => r.id === formData.regionId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Təhsil müəssisələri</h1>
          <p className="text-sm text-gray-500">Cəmi {total} müəssisə</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Bağla" : "Yeni müəssisə"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input placeholder="Müəssisənin adı" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Select
              options={Object.entries(INSTITUTION_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, type: TYPE_BY_CATEGORY[e.target.value][0] })}
            />
            <Select
              options={(TYPE_BY_CATEGORY[formData.category] || []).map((t) => ({ value: t, label: INSTITUTION_TYPE_LABELS[t] }))}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Select
              placeholder="Şəhər/rayon seçin"
              options={regions.map((r) => ({ value: r.id, label: r.name }))}
              value={formData.regionId}
              onChange={(e) => setFormData({ ...formData, regionId: e.target.value, districtId: "" })}
            />
            {region?.districts?.length > 0 && (
              <Select
                placeholder="Rayon (istəyə bağlı)"
                options={region.districts.map((d: any) => ({ value: d.id, label: d.name }))}
                value={formData.districtId}
                onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
              />
            )}
            <Input placeholder="Ünvan (istəyə bağlı)" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <div className="sm:col-span-2 lg:col-span-3">
              {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}
              <Button type="submit">Əlavə et</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input className="pl-9" placeholder="Müəssisə axtar" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select placeholder="Kateqoriya" options={Object.entries(INSTITUTION_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Select placeholder="Şəhər/rayon" options={regions.map((r) => ({ value: r.id, label: r.name }))} value={regionId} onChange={(e) => setRegionId(e.target.value)} />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-400">Heç bir müəssisə tapılmadı.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-400">
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Növ</th>
                <th className="px-4 py-3">Şəhər</th>
                <th className="px-4 py-3">Rayon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mənbə</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{i.name}</td>
                  <td className="px-4 py-3">{INSTITUTION_TYPE_LABELS[i.type]}</td>
                  <td className="px-4 py-3">{i.region?.name}</td>
                  <td className="px-4 py-3">{i.district?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={i.isActive ? "" : "bg-gray-100 text-gray-500"}>{i.isActive ? "Aktiv" : "Deaktiv"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{i.source || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {i.isActive && (
                      <button onClick={() => handleDeactivate(i.id)} className="text-gray-400 hover:text-red-600" title="Deaktiv et">
                        <Power className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
