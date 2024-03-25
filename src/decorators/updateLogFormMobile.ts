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
export default function UpdateLogFormMobileDecorators() {
  const UpdateLogFormMobileDecorators: Array<CombineDecoratorType> = [
    Put('logForm/update'),
    SetMetadata('permissions', [UNITS.LIST]),
    ApiBearerAuth('access-token'),
    ApiConsumes('multipart/form-data'),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('UNIT', 'LIST')),
  ];
  return CombineDecorators(UpdateLogFormMobileDecorators);
}