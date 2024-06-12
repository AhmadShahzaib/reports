import { HttpStatus, Post, SetMetadata } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiConsumes,
} from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  INSPECTIONS,
  USER
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { DefectsType, InspectionType } from 'enums';
import { InspectionRequest } from 'models/inspectionRequestModel';

export default function AddInspectionDecorators() {
  const example1: InspectionRequest = {
    carrier: 'tekhqs',
    location: {
      longitude: 0,
      latitude: 0,
    },
    inspectionType: InspectionType.POST_TRIP,
    odoMeterSpeed: 6456,
    defectsCategory: {
      vehicle: [
        {
          defectsType: DefectsType.MAJOR,
          Notes: 'string',
          imageName: 'string',
          defects: '62fe35761bcceaabb99f556f',
        },
      ],
      trailer: [
        {
          defectsType: DefectsType.MINOR,
          Notes: 'string',
          imageName: 'string',
          defects: '62fe35761bcceaabb99f556f',
        },
      ],
    },
    isActive: true,
  };

  const responseExample = {
    message: 'Inspection has been added successfully',
    data: [
      {
        id: '634e3a8732814050b84d14f7',
        carrier: 'tekhqs',
        Location: {
          longitude: 0,
          latitude: 0,
          address: '',
        },
        driverId: '630f555ae26f781302b3c83d',
        vehicleId: '630f53e6dacee167c7b8b98e',
        inspectionType: 'posttrip',
        inspectionTime: 1666071165,
        defectsCategory: {
          id: '634e3a8732814050b84d14f8',
          vehicle: [
            {
              defectsType: 'major',
              id: '634e3a8732814050b84d14f9',
              Notes: 'string',
              imageName: 'eldLogo.png',
              defects: {
                id: '634cf360acb6d8b29a7f8682',
                defectName: 'air comprassor',
                category: 'vehicle',
                isActive: true,
              },
            },
          ],
          trailer: [
            {
              defectsType: 'major',
              id: '634e3a8732814050b84d14fa',
              Notes: 'string',
              imageName: 'example.png',
              defects: {
                id: '634cf3aeacb6d8b29a7f8686',
                defectName: 'comprassor',
                category: 'trailer',
                isActive: true,
              },
            },
          ],
        },
        isActive: true,
      },
    ],
  };
  const AddInspectionDecorators: Array<CombineDecoratorType> = [
    Post('add'),
    SetMetadata('permissions', [USER.ADD, INSPECTIONS.ADD]),
    ApiBearerAuth("access-token"),
    ApiConsumes('multipart/form-data'),
    ApiExtraModels(InspectionRequest),
    ApiBody({
      examples: {
        'example 1': { value: example1 },
      },
      schema: {
        $ref: getSchemaPath(InspectionRequest),
      },
    }),
    ApiOkResponse({
      content: {
        'application/json': {
          examples: {
            'example 1': { value: responseExample },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('Inspection', 'Add')),
  ];
  return CombineDecorators(AddInspectionDecorators);
}
