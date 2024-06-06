import { Document, Schema } from 'mongoose';
import { DefectsType, InspectionType } from 'enums';

export default interface TIDocument extends Document {
  driverId: string;
  vehicleId: string;
  officeId: string;
  vehicleManualId?: string,
  driverManualId?:string,
  trailerNumber?:string,
  carrier: string;
  tenantId: string;
  location?: {
    longitude: number;
    latitude: number;
    address?: string;
  };
  odoMeterReading?: number;
  inspectionTime: number;
  inspectionType: InspectionType;
  defectsCategory?: DefectsCategoryDocument;
  signatures?: signatureDocument; //need to make it compulsary when upload module is done
  isActive: boolean;
  isDeleted:boolean;
  
}

export interface DefectsCategoryDocument extends Document {
  vehicle?: [DefectsInstance];
  trailer?: [DefectsInstance];
}
export interface SignatureInstance extends Document {
  imageUrl?: string;
  key?: string;
  imageName?: string;
}

export interface signatureDocument extends Document {
  driverSignature: SignatureInstance;
  mechanicSignature: SignatureInstance;
}
export interface DefectsInstance extends Document {
  defectsType?: DefectsType;
  Notes?: string;
  resolved: boolean;
  imageUrl?: string;
  key?: string;
  imageName?: string;
  defects?: string;
}
