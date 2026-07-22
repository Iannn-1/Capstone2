'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StatsCards from '@/components/StatsCards';
import { useStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatsPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useStats();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Statistics</h1>
            <p className="text-muted-foreground">
              Detailed attendance analytics and insights
            </p>
          </div>

          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="w-full animate-pulse">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : statsError ? (
                <div className="text-red-500">Error loading statistics</div>
              ) : statsData ? (
                <StatsCards stats={statsData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No statistics data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Present</span>
                    <span className="font-semibold">{statsData?.presentCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Absent</span>
                    <span className="font-semibold">{statsData?.absentCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On Time</span>
                    <span className="font-semibold">{statsData?.onTimeCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late</span>
                    <span className="font-semibold">{statsData?.lateCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/students')}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Manage Students
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
