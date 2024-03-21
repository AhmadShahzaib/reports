import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsType } from 'enums';

export class DefectsInstance {
  @ApiProperty({ enum: DefectsType })
  @IsEnum(DefectsType)
  defectsType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  Notes: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageName: string;

  imageUrl?: string;

  key?: string;

  tenantId?: string;

  @ApiProperty()
  defects?: string;

  @ApiProperty()
  resolved?: boolean;
}
