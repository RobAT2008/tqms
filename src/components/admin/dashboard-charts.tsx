"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const COLORS = ["#0B3D91", "#1FA37A", "#3F77D6", "#F5A623", "#D64545", "#8B5CF6"];

export function DashboardCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Təhsil səviyyəsinə görə tələbələr</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data.byLevel} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={90} label>
              {data.byLevel.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Şəhər/rayona görə tələbələr</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.byRegion} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="region" width={110} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0B3D91" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Bitirdiyi ilə görə tələbələr</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.byYear}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1FA37A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Ən çox tələbə göndərən müəssisələr</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.byInstitution} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="institution" width={140} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3F77D6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
