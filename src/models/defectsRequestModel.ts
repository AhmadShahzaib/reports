import { IsNotEmpty, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsCategory } from 'enums';

export class DefectsRequest {
  @ApiProperty({ enum: DefectsCategory })
  @IsEnum(DefectsCategory)
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  defectName: string;

  tenantId?: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
