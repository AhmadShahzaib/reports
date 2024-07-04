import { Get, HttpStatus, SetMetadata } from '@nestjs/common';

import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  INSPECTIONS,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function GetDefectsDecorators() {
  const response = {
    message: 'Defects list found',
    data: [
      {
        id: 'string',
        defectName: 'string',
        category: 'string',
        tenantId: {},
        isActive: true,
      },
    ],
  };
  const GetDefectsDecorators: Array<CombineDecoratorType> = [
    Get('/defectslist'),
    SetMetadata('permissions', ["d2v0i4r"]),
    ApiBearerAuth('access-token'),
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
  return CombineDecorators(GetDefectsDecorators);
}
