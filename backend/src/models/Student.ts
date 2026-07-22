import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { StudentAttributes } from '../types/models';

// id, createdAt, and updatedAt are auto-generated on creation
type StudentCreationAttributes = Optional<StudentAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Student extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes {
  public id!: number;
  public rfid_tag_uid!: string;
  public name!: string;
  public grade_level!: string;
  public section!: string;
  public parent_name!: string;
  public parent_email!: string;
  public parent_phone!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    rfid_tag_uid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        len: [0, 255],
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
    grade_level: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
    section: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
    parent_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
    parent_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        len: [0, 255],
      },
    },
    parent_phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
  },
  {
    sequelize,
    tableName: 'students',
    modelName: 'Student',
    indexes: [
      {
        unique: true,
        fields: ['rfid_tag_uid'],
      },
    ],
  },
);

export default Student;
