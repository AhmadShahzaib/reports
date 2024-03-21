
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

export default function GetCsvDecoratorMobile() {
  const GetCsvDecorator: Array<CombineDecoratorType> = [
    Get('mobile/csvWebSubmission'),
    SetMetadata('permissions', [REPORT.GETBYID]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see CSV for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetCsvDecorator);
}
