import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';
import { BaseResponseType } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { DefectsCategory, InspectionType } from 'enums';
import DefectsDocument from 'mongoDb/documents/defectsDocument';
import { DefectsCategoryRequest } from './defectCategoryModel';
import TIDocument from 'mongoDb/documents/TIDocument';
import { doc } from 'prettier';
import { DefectsCategoryResponse } from './defectCategoryResponseModel';
import { SignaturesResponse } from './signatureResponseModel/signatureResponse';
export class InspectionResponse extends BaseResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  carrier: string;

  @ApiProperty()
  Location?: {
    longitude: number;
    latitude: number;
    address?: string;
  };
  @ApiProperty()
  driverId: string;

  @ApiProperty()
  vehicleId: string;

  @ApiProperty()
  vehicleManualId?: string;

  @ApiProperty()
  trailerNumber?: string;

  @ApiProperty()
  odoMeterSpeed?: number;

  @ApiProperty()
  inspectionTime: number;

  @ApiProperty()
  inspectionType?: InspectionType;

  @ApiProperty()
  defectsCategory?: DefectsCategoryResponse;

  @ApiProperty()
  tenantId?: string;

  @ApiProperty()
  signatures?: SignaturesResponse;

  @ApiProperty()
  isActive: boolean;

  constructor(document: TIDocument) {
    super();
    this.id = document.id;
    this.carrier = document.carrier;
    this.Location = document.location;
    this.driverId = document.driverId;
    this.vehicleId = document.vehicleId;
    this.tenantId = document.tenantId;
    this.vehicleManualId = document.vehicleManualId;
    this.trailerNumber = document.trailerNumber;
    this.inspectionType = document.inspectionType;
    this.inspectionTime = document.inspectionTime;
    if(document.defectsCategory){
      this.defectsCategory = new DefectsCategoryResponse(
        document.defectsCategory,
      );
    }
    this.signatures = new SignaturesResponse(document?.signatures);
    this.isActive = document.isActive;
  }
}
