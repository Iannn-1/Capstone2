import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AttendanceStats, ApiResponse } from '@/types';

const fetchStats = async (): Promise<AttendanceStats> => {
  const response = await api.get<ApiResponse<AttendanceStats>>('/dashboard/stats');
  return response.data.data;
};

export const useStats = () => {
  return useQuery<AttendanceStats, Error>({
    queryKey: ['stats', 'today'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    retry: 3,
  });
};
