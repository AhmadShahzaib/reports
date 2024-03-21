import { Get, HttpStatus, SetMetadata } from '@nestjs/common';
import { searchableAttributes, sortableAttributes } from 'models';

import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  DEFECTS
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function GetAllSubmittedRecords() {
  let response = {
    message: 'getAllSubmittedRecords list found',
    
  };
  const GetAllSubmittedRecords: Array<CombineDecoratorType> = [
    Get('getAllSubmittedRecords/all'),
    SetMetadata('permissions', [DEFECTS.LIST]),
    ApiBearerAuth("access-token"),
    ApiQuery({
      name: 'search',
      example: 'search by origin, Driver name,  Investigation Code, createdAt etc',
      required: false,
    }),
    ApiQuery({
      name: 'orderBy',
      example: 'Field by which record will be ordered',
      required: false,
      enum: sortableAttributes,
    }),
    ApiQuery({
      name: 'orderType',
      example: 'Ascending(1),Descending(-1)',
      enum: [1, -1],
      required: false,
    }),
    ApiQuery({
      name: 'pageNo',
      example: '1',
      description: 'The pageNo you want to get e.g 1,2,3 etc',
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      content: {
        'application/json': {
          examples: {
            'example 1': { value: response },
          },
        },
      },
    }),
  ];
  return CombineDecorators(GetAllSubmittedRecords);
}
