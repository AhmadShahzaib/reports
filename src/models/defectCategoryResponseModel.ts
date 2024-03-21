import { IsNotEmpty, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsCategory } from 'enums';
import { DefectsInstance } from './defectInstanceModel';
import { Type } from 'class-transformer';
import { DefectsInstanceResponse } from './defectsInstanceResponseModel';
import { DefectsCategoryRequest } from './defectCategoryModel';

export class DefectsCategoryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [DefectsInstanceResponse] })
  @Type(() => DefectsInstanceResponse)
  vehicle?: DefectsInstanceResponse[];

  @ApiProperty({ type: [DefectsInstanceResponse] })
  @Type(() => DefectsInstanceResponse)
  trailer?: DefectsInstanceResponse[];
  constructor(entry: any) {
    this.id = entry.id;
    this.vehicle = entry?.vehicle.map(
      (item) => new DefectsInstanceResponse(item),
    );
    this.trailer = entry?.trailer.map(
      (item) => new DefectsInstanceResponse(item),
    );
  }
}
