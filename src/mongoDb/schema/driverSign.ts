import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { signatureInstance } from './TISchema';
export const DriverSignSchema = new mongoose.Schema({
  date: { required: false, type: Number },
  sign: { require: false, type: signatureInstance },
  driverId: { required: false, type: String },
  shippingDocument: [],
  homeTerminalAddressId:{required:false, type: Schema.Types.ObjectId},
  from: { required: false, type: String },
  to: { required: false, type: String },
  odoMeterSpeed: { required: false, type: Number },
  tenantId: { type: Schema.Types.ObjectId, require: true },
  trailerNumber:[],
});
