import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController';

/**
 * Student management routes — all protected by JWT auth
 *
 * POST   /           — create a student
 * GET    /           — list all students
 * GET    /:id        — get a student by id
 * PUT    /:id        — update a student
 * DELETE /:id        — delete a student
 */
const router = Router();

router.use(authMiddleware);

router.post('/', createStudent);
router.get('/', listStudents);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
