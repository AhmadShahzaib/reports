import { Get, HttpStatus, Post, SetMetadata } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  INSPECTIONS,
  USER,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function GetReportsDecorators() {
  const GetReportsDecorators: Array<CombineDecoratorType> = [
    Get('report/dailyLogReport'),
    SetMetadata('permissions', [INSPECTIONS.LIST]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetReportsDecorators);
}
export function GetEmailDecorator() {
  const GetEmailDecorator: Array<CombineDecoratorType> = [
    Get('report/email'),
    SetMetadata('permissions', [INSPECTIONS.LIST]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'email',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetEmailDecorator);
}
export function GetEmail7DaysDecorator() {
  const GetEmail7DaysDecorator: Array<CombineDecoratorType> = [
    Get('report/email7Days'),
    SetMetadata('permissions', [INSPECTIONS.LIST]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'email',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetEmail7DaysDecorator);
}

export function GetReportsMobileDecorators() {
  const GetReportsDecoratorMobile: Array<CombineDecoratorType> = [
    Get('report/mobile'),
    SetMetadata('permissions', [USER.ADD]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetReportsDecoratorMobile);
}
export function GetPrevious7Days() {
  const GetPrevious7Days: Array<CombineDecoratorType> = [
    Get('report/previous7Days'),
    SetMetadata('permissions', [INSPECTIONS.LIST, USER.ADD]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'date',
      example: '2022-09-25',
      required: true,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'driverId',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetPrevious7Days);
}
export function GetIFTAReport() {
  const GetIFTAReport: Array<CombineDecoratorType> = [
    Post('report/iftaReport'),
    SetMetadata('permissions', [INSPECTIONS.LIST]),
    ApiBearerAuth('access-token'),
    ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'startDate',
      example: '2022-09-25',
      required: false,
    }),  ApiQuery({
      description: 'The date you want to see Report for.',
      name: 'endDate',
      example: '2022-09-25',
      required: false,
    }),ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'vehicles',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiQuery({
      description: 'The driverId only for backoffice',
      name: 'states',
      example: 'ADBH456GYVYGV445J645',  
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  ];
  return CombineDecorators(GetIFTAReport);
}
 
// {{#each daa}}
// <div class="tableData">
//   <table style="text-align: center;">
//     <caption><h3>{{@key}}</h3></caption>
//     <tr>
//       <th>No</th>
//       <th>State</th>
//       <th>Identified Miles</th>
//       <th>Unidentified Miles</th>
//       <th>Total</th>
//     </tr>
//     {{#each this.data}}
//     <tr>
//       {{#if this.total.length}}
//       <td >{{@index}}</td>
//       {{#each this}}
//       <td>{{this}}</td>
//       {{/each}}
//     </tr>
//     {{/each}}
//     <tr>
//       <td colspan="2" class="no-border">Total</td>
//       {{#each this.total}}
//       <td>{{this}}</td>
//       {{/each}}
//     </tr>
//     {{else}}
//     <td colspan="5">No Record</td>
//     {{/if}}
   
    
//   </table>
// </div>
// {{/each}}
