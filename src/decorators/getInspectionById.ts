import { Get, HttpStatus, SetMetadata } from '@nestjs/common';

import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  INSPECTIONS,
  USER,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function GetByIdDecorators() {
  let response = {
    message: 'Trip inspectns found',
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
        signatures: {
          driverSignature: {
            imageName: 'string',
            key: 'string',
            imagePath: 'string',
          },
          mechanicSignature: {
            imageName: 'string',
            key: 'string',
            imagePath: 'string',
          },
        },
        isActive: true,
      },
    ],
  };
  const GetByIdDecorators: Array<CombineDecoratorType> = [
    Get(':id'),
    SetMetadata('permissions', [USER.ADD, INSPECTIONS.GETBYID]),
    ApiBearerAuth('access-token'),
    ApiParam({
      name: 'id',
      description: 'The ID of the inspection you want to get.',
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
  return CombineDecorators(GetByIdDecorators);
}
