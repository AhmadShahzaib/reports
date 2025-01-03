import { Get, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  UNITS,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export function GetLogFormDecoratorMobile() {
  const GetLogFormDecoratorMobile: Array<CombineDecoratorType> = [
    Get('logForm/mobile'),
    SetMetadata('permissions', [UNITS.LIST]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see LogForm',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetLogFormDecoratorMobile);
}
