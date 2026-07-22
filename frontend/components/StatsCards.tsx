'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AttendanceStats } from '@/types';

interface StatsCardsProps {
  stats: AttendanceStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: 'Present',
      value: stats.presentCount,
      color: 'bg-green-500',
    },
    {
      title: 'Absent',
      value: stats.absentCount,
      color: 'bg-red-500',
    },
    {
      title: 'On-time',
      value: stats.onTimeCount,
      color: 'bg-blue-500',
    },
    {
      title: 'Late',
      value: stats.lateCount,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div
              className={`h-4 w-4 rounded-full ${stat.color}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
