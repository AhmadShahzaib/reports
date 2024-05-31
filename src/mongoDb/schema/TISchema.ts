import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  InspectionType,
  DefectsType,
  vehicleDefectList,
  trailerDefectList,
} from 'enums';
// const TimeZoneSchema = new mongoose.Schema(
//   {
//     tzCode: { type: String, required: true },
//     utc: { type: String, required: true },
//     label: { type: String },
//     name: { type: String },
//   },
//   { _id: false },
// );

// const DefectsInstance = {
//   defectsType: { type: String, enum: DefectsType },
//   Notes: { type: String, required: true },
//   key: { type: String, required: false },
//   imageUrl: { type: String, required: false },
//   imageName: { type: String, required: false },
//   resolved: { type: Boolean, require: true },
//   defects: { type: Schema.Types.ObjectId, require: true, ref: 'defects' },
// };

const vehicleDefectsList = {
  defectName: { type: String },
  defectStatus: { type: Boolean, default: false },
};

const trailerDefectsList = {
  defectName: { type: String },
  defectStatus: { type: Boolean, default: false },
};

const DefectsCategorySchema = {
  vehicle: { type: [vehicleDefectsList] },
  trailer: { type: [trailerDefectsList] },
};

export const signatureInstance = {
  key: { type: String, required: false },
  imageUrl: { type: String, required: false },
  imageName: { type: String, required: false },
};

const signaturesSchema = {
  driverSignature: signatureInstance,
  mechanicSignature: signatureInstance,
};

export const TISchema = new mongoose.Schema({
  driverId: { type: Schema.Types.ObjectId, require: true },
  vehicleId: { type: Schema.Types.ObjectId, require: true },
  officeId: { type: String, require: false },
  vehicleManualId: { required: false, type: String },
  trailerNumber: { required: true, type: String },
  carrier: { required: false, type: String },
  location: { type: String, required: true },
  odoMeterSpeed: { required: true, type: Number },
  inspectionTime: { required: true, type: Number },
  inspectionDate: { required: true, type: String },
  // inspectionType: { required: true, type: String, enum: InspectionType },
  defectsCategory: { require: false, type: DefectsCategorySchema },
  signatures: { require: true, type: signaturesSchema },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  tenantId: { type: Schema.Types.ObjectId, require: true },
});
