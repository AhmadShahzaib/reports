import { IsNotEmpty, IsString, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefectsType } from 'enums';
import { DefectsInstance } from './defectInstanceModel';
import { DefectResponse } from './defectsResponseModel';

export class DefectsInstanceResponse {
  @ApiProperty()
  id: string;
  @ApiProperty({ enum: DefectsType })
  @IsEnum(DefectsType)
  defectsType?: string;

  @ApiProperty()
  Notes?: string;

  @ApiProperty()
  imageName?: string;

  tenantId?: string;

  key: string;

  @ApiProperty()
  resolved?: boolean;
 
  @ApiPropertyOptional()
  imagePath?: string;

  @ApiProperty()
  defects?: DefectResponse;
  constructor(entry: any) {
    this.defectsType = entry.defectsType;
    this.id = entry.id;
    this.Notes = entry.Notes;
    this.imageName = entry.imageName;
    this.imagePath = entry.imageUrl;
    this.tenantId = entry.tenantId;
    this.key = entry.key;
    this.defects = new DefectResponse(entry.defects);
    this.resolved=entry.resolved;
  }
}
