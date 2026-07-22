import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AttendanceLogAttributes } from '../types/models';

// id, scan_time, createdAt, and updatedAt are auto-generated / defaulted on creation
type AttendanceLogCreationAttributes = Optional<
  AttendanceLogAttributes,
  'id' | 'scan_time' | 'createdAt' | 'updatedAt'
>;

class AttendanceLog
  extends Model<AttendanceLogAttributes, AttendanceLogCreationAttributes>
  implements AttendanceLogAttributes
{
  public id!: number;
  public student_id!: number;
  public scan_time!: Date;
  public status!: 'IN' | 'OUT';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AttendanceLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    scan_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('IN', 'OUT'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'AttendanceLogs',
    timestamps: true,
  }
);

export default AttendanceLog;
