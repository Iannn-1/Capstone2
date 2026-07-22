import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AttendanceLogWithStudent, ApiResponse } from '@/types';

const fetchAttendance = async (): Promise<AttendanceLogWithStudent[]> => {
  const response = await api.get<ApiResponse<AttendanceLogWithStudent[]>>('/dashboard/attendance');
  return response.data.data;
};

export const useAttendance = () => {
  return useQuery<AttendanceLogWithStudent[], Error>({
    queryKey: ['attendance', 'today'],
    queryFn: fetchAttendance,
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    retry: 3,
  });
};
