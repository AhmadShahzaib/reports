import * as mongoose from 'mongoose';
export const iftaSubmissionRecord = new mongoose.Schema(
  {
    reportType: { required: false, type: String },
    Name: { required: false, type: String },
    recipient: { required: false, type: String },
    createdAt: { required: true, type: String },
    pdf: { required: false, type: String },
    csv: { required: true, type: String },
    tenantId:{required: true, type: String,}
  },
  {
    timestamps: true,
  },
);
