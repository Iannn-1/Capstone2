'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StudentForm from '@/components/StudentForm';
import { useStudents } from '@/hooks/useStudents';
import { Student, StudentFormInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      const currentUser = getUser();
      if (currentUser) {
        setUser({ name: currentUser.name, role: currentUser.role });
      }
    }
  }, [router]);

  const {
    studentsQuery,
    createStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  } = useStudents();

  const { data: students, isLoading, error, refetch } = studentsQuery;

  const handleCreate = (data: StudentFormInput) => {
    createStudentMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        refetch();
      },
    });
  };

  const handleUpdate = (data: StudentFormInput) => {
    if (editingStudent) {
      updateStudentMutation.mutate(
        { id: editingStudent.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingStudent(null);
            refetch();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudentMutation.mutate(id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  if (!isAuthenticated() || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">
                Manage student records and information
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </DialogTitle>
                </DialogHeader>
                <StudentForm
                  onSubmit={editingStudent ? handleUpdate : handleCreate}
                  defaultValues={editingStudent || undefined}
                  isLoading={
                    createStudentMutation.isPending ||
                    updateStudentMutation.isPending
                  }
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">Error loading students</div>
              ) : students && students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>RFID Tag UID</TableHead>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.grade_level}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.rfid_tag_uid}
                        </TableCell>
                        <TableCell>{student.parent_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(student.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No students found. Add your first student to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
