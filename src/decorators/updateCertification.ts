
import { Get, HttpStatus, SetMetadata } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  REPORT,
  USER,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function updateCertification() {
  const updateCertification: Array<CombineDecoratorType> = [
    Get('csv/updateCertification'),
    SetMetadata('permissions', [REPORT.GETBYID, USER.ADD]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see CSV for.',
      name: 'dates',
      example: '[2022-09-25]',
      required: true,
    }),   ApiQuery({
      description: 'The date you want to see CSV for.',
      name: 'time',
      example: '2022-09-25',
      required: false,
    }),
    ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: ['ADBH456GYVYGV445J645'],
      required: true,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'signature',
      example: "https://eld-uploads.s3.amazonaws.com/6329cdf541c5047250e3d821/6477146a7b70ac5e4aeb7974/Signatures/1685538756-20230531_181226_0.4633198635527731.png",
      required: true,
    }),
   
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(updateCertification);
}
