import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Student, StudentFormInput, ApiResponse, ApiErrorResponse } from '@/types';

const fetchStudents = async (): Promise<Student[]> => {
  const response = await api.get<ApiResponse<Student[]>>('/students');
  return response.data.data;
};

const createStudent = async (studentData: StudentFormInput): Promise<Student> => {
  const response = await api.post<ApiResponse<Student>>('/students', studentData);
  return response.data.data;
};

const updateStudent = async (id: string, studentData: Partial<StudentFormInput>): Promise<Student> => {
  const response = await api.put<ApiResponse<Student>>(`/students/${id}`, studentData);
  return response.data.data;
};

const deleteStudent = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/students/${id}`);
  return response.data.data;
};

export const useStudents = () => {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: fetchStudents,
    retry: 3,
  });

  const createStudentMutation = useMutation<Student, ApiErrorResponse, StudentFormInput>({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateStudentMutation = useMutation<Student, ApiErrorResponse, { id: string; data: Partial<StudentFormInput> }>({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteStudentMutation = useMutation<{ message: string }, ApiErrorResponse, string>({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  return {
    studentsQuery,
    createStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  };
};
