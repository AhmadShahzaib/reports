import { IsNotEmpty, IsString, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DefectsType } from 'enums';
class signatureInstance {
  @ApiProperty()
  imageName?: string;
  imageUrl?: string;
  key?: string;
}
export class SignatureModel {
  @ApiProperty({
    type: signatureInstance,
  })
  driverSignature?: signatureInstance;
  @ApiProperty({
    type: signatureInstance,
  })
  mechanicSignature?: signatureInstance;
}
