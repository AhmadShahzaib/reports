import { IsNotEmpty, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class Signature {
  @ApiPropertyOptional()
  imageName?: string;
  key?: string;
  imagePath?: string;
  constructor(entry: any) {
    this.imageName = entry?.imageName;
    this.imagePath = entry?.imageUrl;
    this.key = entry?.key;
  }
}
export class SignaturesResponse {
  @ApiPropertyOptional({ type: Signature })
  @Type(() => Signature)
  driverSignature?: Signature;

  @ApiPropertyOptional({ type: Signature })
  @Type(() => Signature)
  mechanicSignature?: Signature;
  constructor(entry: any) {
    this.driverSignature = new Signature(entry?.driverSignature);
    this.mechanicSignature = new Signature(entry?.mechanicSignature);
  }
}
