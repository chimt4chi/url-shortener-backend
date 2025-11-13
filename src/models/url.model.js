import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const URL = sequelize.define(
  "URL",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    originalUrl: { type: DataTypes.STRING, allowNull: false },
    shortCode: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    accessCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

export default URL;
