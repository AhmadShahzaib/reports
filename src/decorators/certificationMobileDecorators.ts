import { HttpStatus, Put, SetMetadata } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  UNITS,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
export default function certificationMobileDecorators() {
  const certificationMobileDecorators: Array<CombineDecoratorType> = [
    Put('logForm/certification'),
    SetMetadata('permissions', [UNITS.LIST]),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('UNIT', 'LIST')),
  ];
  return CombineDecorators(certificationMobileDecorators);
}
