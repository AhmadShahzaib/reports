import { Delete, HttpStatus, Post, SetMetadata } from '@nestjs/common';

import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  REPORT,
  USER,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function DeleteIFTA() {
  const DeleteIFTA: Array<CombineDecoratorType> = [
    Post('deleteIFTA/:id'),
    SetMetadata('permissions', ["fmed5idea"]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK }),
    ApiParam({
      name: 'id',
      description: 'The ID of the Inspection you want to delete.',
    }),
  ];
  return CombineDecorators(DeleteIFTA);
}
