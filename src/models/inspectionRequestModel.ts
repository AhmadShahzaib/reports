import {
  IsBoolean,
  IsEnum,
  IsJSON,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsCategory, InspectionType } from 'enums';
import { DefectsCategoryRequest } from './defectCategoryModel';
import { Transform } from 'class-transformer';
import { SignatureModel } from './signatureRequestModel';
class location {
  address?: string;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  latitude: number;
}

export class InspectionRequest {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  defectImages?: Express.Multer.File[];

  @ApiProperty()
  carrier: string;

  @ApiProperty()
  @Transform(({ value }) => JSON.parse(value))
  location?: location;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  inspectionTime?: number;

  driverId?: string;
  vehicleId?: string;
  officeId?: string;
  vehicleManualId?: string;
  trailerNumber?: string;

  @ApiProperty({ enum: InspectionType })
  @IsEnum(InspectionType)
  inspectionType?: string;

  @ApiProperty()
  @Transform(({ value }) => JSON.parse(value))
  odoMeterSpeed: number;

  @ApiProperty()
  @Transform(({ value }) => JSON.parse(value))
  defectsCategory?: DefectsCategoryRequest;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  signatureImages?: Express.Multer.File[];

  @ApiProperty()
  @Transform(({ value }) => JSON.parse(value))
  signatures?: SignatureModel;

  isActive?: boolean;

  tenantId?: string;
}
