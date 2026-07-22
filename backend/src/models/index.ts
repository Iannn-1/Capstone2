import { sequelize } from '../config/database';
import AttendanceLog from './AttendanceLog';
import Student from './Student';
import User from './User';

// Define associations
Student.hasMany(AttendanceLog, { foreignKey: 'student_id', onDelete: 'RESTRICT' });
AttendanceLog.belongsTo(Student, { foreignKey: 'student_id', as: 'Student' });

export { sequelize, AttendanceLog, Student, User };
