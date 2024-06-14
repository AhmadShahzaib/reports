import { HttpStatus, Post, Put, SetMetadata } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  UNITS,
  USER,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { LogFormRequest } from 'models/logForm';
export default function UpdateLogFormDecorators() {
  const example1: LogFormRequest = {
    odoMeterSpeed: 6456,
    homeTerminalAddressId: '6367ae32d9d62f314eaadaff',
    homeTerminalAddress:'address',
    shippingDocument: [],
    from:"address",
    to:"address",
    trailerNumber:[]
  };

  const UpdateLogFormDecorators: Array<CombineDecoratorType> = [
    Put('logForm/update/:driverId'),
    SetMetadata('permissions', [UNITS.LIST]),
    ApiBearerAuth('access-token'),
    ApiParam({
        name: 'driverId',
        description: 'The ID of the driverId you want to update log form',
      }),
    ApiConsumes('multipart/form-data'),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('UNIT', 'LIST')),
  ];
  return CombineDecorators(UpdateLogFormDecorators);
}
