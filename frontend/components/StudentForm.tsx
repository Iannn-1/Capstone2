'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { StudentFormInput } from '@/types';

const studentFormSchema = z.object({
  rfid_tag_uid: z.string().min(1, 'RFID Tag UID is required'),
  name: z.string().min(1, 'Name is required'),
  grade_level: z.string().min(1, 'Grade Level is required'),
  section: z.string().min(1, 'Section is required'),
  parent_name: z.string().min(1, 'Parent Name is required'),
  parent_email: z.string().email('Invalid email address'),
  parent_phone: z.string().min(1, 'Parent Phone is required'),
});

interface StudentFormProps {
  onSubmit: (data: StudentFormInput) => void;
  defaultValues?: Partial<StudentFormInput>;
  isLoading?: boolean;
}

export default function StudentForm({
  onSubmit,
  defaultValues,
  isLoading = false,
}: StudentFormProps) {
  const form = useForm<StudentFormInput>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      rfid_tag_uid: '',
      name: '',
      grade_level: '',
      section: '',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      ...defaultValues,
    },
  });

  const handleSubmit = (data: StudentFormInput) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rfid_tag_uid">RFID Tag UID *</Label>
          <Input
            id="rfid_tag_uid"
            {...form.register('rfid_tag_uid')}
            placeholder="Enter RFID Tag UID"
          />
          {form.formState.errors.rfid_tag_uid && (
            <p className="text-sm text-red-500">
              {form.formState.errors.rfid_tag_uid.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Enter student name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade_level">Grade Level *</Label>
          <Input
            id="grade_level"
            {...form.register('grade_level')}
            placeholder="Enter grade level"
          />
          {form.formState.errors.grade_level && (
            <p className="text-sm text-red-500">
              {form.formState.errors.grade_level.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">Section *</Label>
          <Input
            id="section"
            {...form.register('section')}
            placeholder="Enter section"
          />
          {form.formState.errors.section && (
            <p className="text-sm text-red-500">{form.formState.errors.section.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_name">Parent Name *</Label>
          <Input
            id="parent_name"
            {...form.register('parent_name')}
            placeholder="Enter parent name"
          />
          {form.formState.errors.parent_name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.parent_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_email">Parent Email *</Label>
          <Input
            id="parent_email"
            type="email"
            {...form.register('parent_email')}
            placeholder="Enter parent email"
          />
          {form.formState.errors.parent_email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.parent_email.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="parent_phone">Parent Phone *</Label>
          <Input
            id="parent_phone"
            {...form.register('parent_phone')}
            placeholder="Enter parent phone"
          />
          {form.formState.errors.parent_phone && (
            <p className="text-sm text-red-500">
              {form.formState.errors.parent_phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
