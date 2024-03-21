import * as mongoose from 'mongoose';
export const eldSubmitionRecord = new mongoose.Schema(
  {
    dateStart: { required: false, type: String },
    dateEnd: { required: false, type: String },
    errors: { required: false, type: Array<any> },
    status: { required: false, type: String },
    driver: { required: true, type: String },
    submissionID: { required: false, type: String },
    origin: { required: true, type: String },
    eRODScode: { required: true, type: String },
    createdTime: { required: true, type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tenantId:{required: true, type: String},
  },
  {
    timestamps: true,
  },
);
