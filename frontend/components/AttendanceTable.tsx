'use client';

import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { AttendanceLogWithStudent } from '@/types';
import { format } from 'date-fns';

interface AttendanceTableProps {
  logs: AttendanceLogWithStudent[];
}

export default function AttendanceTable({ logs }: AttendanceTableProps) {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'hh:mm a');
    } catch {
      return timeString;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance records found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Grade Level</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Scan Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.Student.name}</TableCell>
            <TableCell>{log.Student.grade_level}</TableCell>
            <TableCell>{log.Student.section}</TableCell>
            <TableCell>
              <Badge
                variant={log.status === 'IN' ? 'default' : 'destructive'}
                className={log.status === 'IN' ? 'bg-green-500' : 'bg-red-500'}
              >
                {log.status}
              </Badge>
            </TableCell>
            <TableCell>{formatTime(log.scan_time)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
