import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-green-600', iconBg = 'bg-green-100' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
