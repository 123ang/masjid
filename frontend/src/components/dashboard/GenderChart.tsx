'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface GenderData {
  lelaki: number;
  perempuan: number;
  unknown: number;
  total: number;
  percentLelaki: number;
  percentPerempuan: number;
  percentUnknown: number;
}

interface GenderChartProps {
  data: GenderData;
}

export default function GenderChart({ data }: GenderChartProps) {
  const chartData = [
    { name: 'Lelaki', value: data.lelaki, percent: data.percentLelaki },
    { name: 'Perempuan', value: data.perempuan, percent: data.percentPerempuan },
  ];

  // Only add unknown if there are unknown values
  if (data.unknown > 0) {
    chartData.push({ name: 'Tidak Dinyatakan', value: data.unknown, percent: data.percentUnknown });
  }

  const COLORS = ['#3b82f6', '#ec4899', '#9ca3af']; // Blue for Lelaki, Pink for Perempuan, Gray for Unknown

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Taburan Jantina
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.lelaki}</p>
              <p className="text-xs text-gray-600">Lelaki</p>
              <p className="text-xs font-semibold text-blue-600">{data.percentLelaki.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <p className="text-2xl font-bold text-pink-600">{data.perempuan}</p>
              <p className="text-xs text-gray-600">Perempuan</p>
              <p className="text-xs font-semibold text-pink-600">{data.percentPerempuan.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.total}</p>
              <p className="text-xs text-gray-600">Jumlah</p>
              <p className="text-xs font-semibold text-purple-600">100%</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} orang (${props.payload.percent.toFixed(1)}%)`,
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Info */}
          {data.unknown > 0 && (
            <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
              * {data.unknown} orang ({data.percentUnknown.toFixed(1)}%) tidak menyatakan jantina
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Data termasuk pemohon dan ahli tanggungan
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
