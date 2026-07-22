import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/index';
import { ApiResponse, ApiErrorResponse, StudentAttributes } from '../types/models';

interface StudentBody {
  rfid_tag_uid: string;
  name: string;
  grade_level: string;
  section: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
}

/**
 * POST /api/v1/students
 * Creates a new student record.
 */
export async function createStudent(
  req: Request<Record<string, never>, ApiResponse<StudentAttributes> | ApiErrorResponse, StudentBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      rfid_tag_uid,
      name,
      grade_level,
      section,
      parent_name,
      parent_email,
      parent_phone,
    } = req.body;

    // Required field validation
    const missing = ['rfid_tag_uid', 'name', 'grade_level', 'section', 'parent_name', 'parent_email', 'parent_phone']
      .filter((f) => !req.body[f as keyof StudentBody]?.toString().trim());

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
      return;
    }

    // Check duplicate RFID
    const existing = await Student.findOne({ where: { rfid_tag_uid } });
    if (existing) {
      res.status(409).json({ success: false, error: 'RFID tag UID already in use' });
      return;
    }

    const student = await Student.create({
      rfid_tag_uid,
      name,
      grade_level,
      section,
      parent_name,
      parent_email,
      parent_phone,
    });

    res.status(201).json({ success: true, data: student.toJSON() as StudentAttributes });
  } catch (err: any) {
    // Sequelize validation errors (e.g. invalid parent_email format)
    if (err.name === 'SequelizeValidationError') {
      const message = err.errors?.[0]?.message ?? 'Validation error';
      if (message.toLowerCase().includes('email')) {
        res.status(400).json({ success: false, error: 'Invalid parent_email format' });
      } else {
        res.status(400).json({ success: false, error: message });
      }
      return;
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ success: false, error: 'RFID tag UID already in use' });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/v1/students
 * Returns all students.
 */
export async function listStudents(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const students = await Student.findAll({ order: [['name', 'ASC']] });
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/students/:id
 * Returns a single student by id.
 */
export async function getStudent(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/students/:id
 * Updates an existing student record.
 */
export async function updateStudent(
  req: Request<{ id: string }, any, Partial<StudentBody>>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    await student.update(req.body);
    res.status(200).json({ success: true, data: student.toJSON() as StudentAttributes });
  } catch (err: any) {
    if (err.name === 'SequelizeValidationError') {
      const message = err.errors?.[0]?.message ?? 'Validation error';
      if (message.toLowerCase().includes('email')) {
        res.status(400).json({ success: false, error: 'Invalid parent_email format' });
      } else {
        res.status(400).json({ success: false, error: message });
      }
      return;
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ success: false, error: 'RFID tag UID already in use' });
      return;
    }
    next(err);
  }
}

/**
 * DELETE /api/v1/students/:id
 * Deletes a student (blocked if they have attendance logs — ON DELETE RESTRICT).
 */
export async function deleteStudent(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    await student.destroy();
    res.status(200).json({ success: true, data: { message: 'Student deleted successfully' } });
  } catch (err: any) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      res
        .status(409)
        .json({ success: false, error: 'Cannot delete student with existing attendance logs' });
      return;
    }
    next(err);
  }
}
