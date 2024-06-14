import { DefectsCategory } from 'enums';
import { SignatureInstance } from './TIDocument';
export default interface DriverSignDocument extends Document {
  sign?: SignatureInstance;
  date?: number;
  driverId?: string;
  homeTerminalAddressId?:string;
  shippingDocument?: [];
  from?: string;
  to?: string;
  notes?:string;
  odoMeterSpeed?: number;
  tenantId?: string;
  trailerNumber?:[];
}
