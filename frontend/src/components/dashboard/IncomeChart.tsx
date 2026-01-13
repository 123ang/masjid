'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IncomeChartProps {
  data: { range: string; count: number }[];
}

export default function IncomeChart({ data }: IncomeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taburan Pendapatan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
