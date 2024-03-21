import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SignatureInstance } from 'mongoDb/documents/TIDocument';

export class LogFormRequest {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  driverSign?: Express.Multer.File;

  @ApiProperty()
  homeTerminalAddressId: string;

  @ApiProperty()
  homeTerminalAddress: string;

  @ApiProperty()
  shippingDocument: [];

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  odoMeterSpeed: number;
  trailerNumber:[];
  sign?: object;
  tenantId?: string;
}
