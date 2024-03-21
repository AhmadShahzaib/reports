
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

export default function GetCertificationDays() {
  const GetCertificationDays: Array<CombineDecoratorType> = [
    Get('csv/unCertifyDays'),
    SetMetadata('permissions', [REPORT.GETBYID, USER.ADD]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see CSV for.',
      name: 'dateStart',
      example: '2022-09-25',
      required: false,
    }),
    ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: ['ADBH456GYVYGV445J645'],
      required: true,
    }),
    ApiQuery({
      description: 'The date you want to see CSV for.',
      name: 'dateEnd',
      example: '2022-09-25',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetCertificationDays);
}
