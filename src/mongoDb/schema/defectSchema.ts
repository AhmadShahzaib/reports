import * as mongoose from 'mongoose';
import { DefectsCategory } from 'enums';

export const DefectSchema = new mongoose.Schema(
  {
    category: { required: true, enum: DefectsCategory, type: String },
    defectName: { require: true, type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
