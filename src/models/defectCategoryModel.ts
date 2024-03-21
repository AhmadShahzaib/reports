import { IsNotEmpty, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsCategory } from 'enums';
import { DefectsInstance } from './defectInstanceModel';
import { Type } from 'class-transformer';

export class DefectsCategoryRequest {
  @ApiProperty({ type: [DefectsInstance] })
  @Type(() => DefectsInstance)
  vehicle?: DefectsInstance[];

  @ApiProperty({ type: [DefectsInstance] })
  @Type(() => DefectsInstance)
  trailer?: DefectsInstance[];
}
