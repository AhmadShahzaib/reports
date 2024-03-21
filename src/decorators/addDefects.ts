import { HttpStatus, Post, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  DEFECTS,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { DefectResponse } from 'models/defectsResponseModel';

export default function AddDefectsDecorators() {
  const AddDecorators: Array<CombineDecoratorType> = [
    Post('add'),
    SetMetadata('permissions', [DEFECTS.ADD]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.CREATED, type: DefectResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('Defects', 'Add')),
  ];
  return CombineDecorators(AddDecorators);
}
