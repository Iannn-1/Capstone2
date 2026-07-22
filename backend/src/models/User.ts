import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserAttributes } from '../types/models';

// id, createdAt, and updatedAt are auto-generated so they are optional on creation
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public role!: 'admin' | 'staff';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      // Exclude password_hash from all queries so it never leaks in API responses
      attributes: { exclude: ['password_hash'] },
    },
  }
);

export default User;
