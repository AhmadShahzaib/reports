import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { InspectionType, DefectsType } from 'enums';
const TimeZoneSchema = new mongoose.Schema(
  {
    tzCode: { type: String, required: true },
    utc: { type: String, required: true },
    label: { type: String },
    name: { type: String },
  },
  { _id: false },
);
const DefectsInstance = {
  defectsType: { type: String, enum: DefectsType },
  Notes: { type: String, required: true },
  key: { type: String, required: false },
  imageUrl: { type: String, required: false },
  imageName: { type: String, required: false },
  resolved: { type: Boolean, require: true },
  defects: { type: Schema.Types.ObjectId, require: true, ref: 'defects' },
};
const DefectsCategorySchema = {
  vehicle: { type: [DefectsInstance], require: false },
  trailer: { type: [DefectsInstance], require: false },
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
  officeId: { type: Schema.Types.ObjectId, require: true },
  vehicleManualId: { required: false, type: String },
  trailerNumber: { required: false, type: String },
  carrier: { required: true, type: String },
  location: {
    required: false,
    longitude: Number,
    latitude: Number,
    address: String,
  },
  odoMeterSpeed: { required: true, type: Number },
  inspectionTime: { required: true, type: Number },
  inspectionType: { required: true, type: String, enum: InspectionType },
  defectsCategory: { require: false, type: DefectsCategorySchema },
  signatures: { require: true, type: signaturesSchema },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  tenantId: { type: Schema.Types.ObjectId, require: true },
});
