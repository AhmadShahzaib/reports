import {
  MongoIdValidationPipe,
  SocketManagerService,
  AwsService,
  ListingParamsValidationPipe,
  ListingParams,
  BaseController,
  getTimeZoneDateRangeForDay,
  MessagePatternResponseType,
  mapMessagePatternResponseToException,
  MessagePatternResponseInterceptor,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { MessagePattern } from '@nestjs/microservices';
import { graphUpdatedData } from 'utils/updatedGraphData';
import states from 'us-state-converter';
import moment from 'moment';
import fs from 'fs';
// const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
import { isActiveinActive } from 'utils/active';
import {
  Controller,
  Param,
  Inject,
  Body,
  Query,
  Res,
  Headers,
  Logger,
  NotFoundException,
  BadRequestException,
  Req,
  HttpStatus,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { AppService } from '../services/app.service';
import AddInspectionDecorators from 'decorators/addInspection';
import { InspectionRequest } from 'models/inspectionRequestModel';
import { InspectionResponse } from 'models/inspectionresponseModel';
import GetInspectionDecorators from 'decorators/getInspection';
import GetAllInspectionDecorators from 'decorators/getAllInspection';

import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { imagesUpload } from 'utils/imagesUpload';
import GetReportsDecorators, {
  GetEmailDecorator,
  GetReportsMobileDecorators,
  GetPrevious7Days,
  GetEmail7DaysDecorator,
  GetIFTAReport,
} from 'decorators/getReports';
import { generatePdf7days } from 'utils/generatePdf7Days';
import { generateIFTA } from 'utils/generateIFTA';
import GetInspectionDecoratorsMobile from 'decorators/inspectionForDriver';
import DeleteDecorators from 'decorators/deleteInspection';
import GetByIdDecorators from 'decorators/getInspectionById';
import { getInspectionData } from 'utils/getInspection';
import UpdateInspectionDecorators from 'decorators/updateInspection';
import UpdateLogFormDecorators from 'decorators/logForm';
import { LogFormRequest } from 'models/logForm';
import { signUpload } from 'utils/signUpload';
import { SignService } from 'services/signService';
import { GetLogFormDecoratorMobile } from 'decorators/getLogFormMobile';
import { getLogsFormData } from 'utils/getlogsFormData';
import { GetLogFormDecorator } from 'decorators/getLogForm';
import UpdateLogFormMobileDecorators from 'decorators/updateLogFormMobile';
import GetCsvDecorator from 'decorators/getcsvDecoators';
import { dateFormat, timeFormat } from 'utils/dateTimeFormat';
import { checkSum, eventCheckSum } from 'utils/checkSum';
import { getLogChecksum } from 'utils/getCheckForDutyLog';
import { isValidVin } from 'utils/vinValidation';
import { isValidCarrierName } from 'utils/carrierNameValidation';
import { fileCheckData } from 'utils/fileDataCheck';
import { fmcsaCall } from 'utils/axiosCall';
import GetAllSubmittedRecords from 'decorators/getAllSubmittedRecords';
import {
  searchableAttributes,
  sortableAttributes,
  iftaSearchables,
} from 'models';
import { getArrayData } from 'utils/getArrayData';
import { fileNameCreation } from 'utils/fileNameCreation';
import GetCsvString from 'decorators/getCsvString';
import sendEmailToFmcsa from 'decorators/sendEmailToFmcsa';
import { convertICDtoV1 } from 'utils/convertICDtoV1';
import { reportEmail } from 'utils/reportEmail';
import { elementAt, firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { generatePdf } from 'utils/generatePdf';
import { each, forEach } from 'lodash';
import GetCertificationDays from 'decorators/getUncertifyDays';
import { Length } from 'class-validator';

import GetAllIFTARecords from 'decorators/getAllIFTAReports';
import DeleteIFTA from 'decorators/deleteIFTA';
import { getEventsCheckSum } from 'utils/eventFuntion';
import { getUnidentifiedcheckSum } from 'utils/getUnidentifiedcheckSum';
import updateCertification from 'decorators/updateCertification';
import { Certificate } from 'crypto';
import { checkSign } from 'utils/isCorrectSign';
import { dispatchNotification } from 'utils/dispatchNotification';
import { splitSign } from 'utils/splitSign';
import { generateUniqueHexId } from 'utils/randomSEQ';
import certificationMobileDecorators from 'decorators/certificationMobileDecorators';
import { generateEditPdf } from 'utils/genrateEditReport';
import { getEventPower } from 'utils/eventPower';
import { getCertificationCheck } from 'utils/eventCertification';
import GetDefectsDecorators from 'decorators/getDefects';
// import { Query } from 'mongoose';
// import { signature } from '../../../logEld-TenantBackendMicroservices-Units-Future/src/models/signaturesModel';

// // Register fonts
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Controller('inspection')
@ApiTags('inspection')
export class AppController extends BaseController {
  private readonly logger = new Logger('TI App Controller');

  constructor(
    private readonly socketManager: SocketManagerService,
    private readonly awsService: AwsService,
    @Inject('AppService') private readonly tripInspectionService: AppService,
    @Inject('SignService') private readonly serviceSign: SignService,
    @Inject('UNIT_SERVICE') private readonly unitClient: ClientProxy, // @Inject('DRIVER_SERVICE') private readonly driverClient: ClientProxy,
    @Inject('PUSH_NOTIFICATION_SERVICE')
    private readonly pushNotificationClient: ClientProxy,
    @Inject('DRIVER_SERVICE') private readonly driverClient: ClientProxy,
  ) {
    super();
  }

  // ######## DVIR ######### - START

  /**
   * @description : Function <addDefectsInspection> adds inspection request
   * @dependency : The function requires defects list to get defects <getDefectsList>
   */
  @AddInspectionDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([
      // { name: 'defectImages', maxCount: 50 },
      { name: 'signatureImages', maxCount: 2 },
    ]),
  )
  async addDefectsInspection(
    // @Body() defectRequest: InspectionRequest,
    @Body() defectRequest,
    @UploadedFiles()
    files: {
      // defectImages: Express.Multer.File[];
      signatureImages: Express.Multer.File[];
    },
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId, id, vehicleId, homeTerminalAddress, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      defectRequest.tenantId = tenantId;
      defectRequest.driverId = id;
      defectRequest.vehicleId = vehicleId;
      defectRequest.officeId = homeTerminalAddress;
      defectRequest.inspectionTime = defectRequest.inspectionTime;
      defectRequest.defectsCategory = JSON.parse(defectRequest.defectsCategory);

      if (Object.keys(files).length == 0) {
        return response.status(HttpStatus.OK).send({
          message: `Driver's signature are required to create an inspection!`,
          data: {},
        });
      }

      defectRequest = {
        ...defectRequest,
        signatures: {
          driverSignature: {
            imageName: files.signatureImages[0].originalname,
          },
        },
      };

      Logger.log('adding image here');
      let requestInspection;
      try {
        requestInspection = await imagesUpload(
          files,
          this.awsService,
          defectRequest,
          tenantId,
          id,
          this.tripInspectionService,
        );
      } catch (error) {
        Logger.error('Error during image upload', error);
        throw new InternalServerErrorException('Image upload failed');
      }
      Logger.log('image added');

      // let unitData = await this.tripInspectionService.getUnitData(id);
      // requestInspection.vehicleManualId = unitData.manualVehicleId;
      // requestInspection.trailerNumber = unitData.trailerNumber;
      requestInspection.vehicleManualId = defectRequest.vehicleManualId;
      requestInspection.trailerNumber = defectRequest.trailerNumber;

      let addDefect;
      try {
        addDefect = await this.tripInspectionService.addInspection(
          requestInspection,
        );
      } catch (error) {
        Logger.error('Error adding inspection', error);
        throw new InternalServerErrorException('Adding inspection failed');
      }

      // let address = await getAddress(addDefect);
      Logger.log(`Inspection has been added successfully`);

      if (addDefect && Object.keys(addDefect).length > 0) {
        Logger.log('Inspection object done');
        return response.status(HttpStatus.OK).send({
          message: 'Inspection has been added successfully',
          data: addDefect,
        });
      } else {
        Logger.log('Inspection not created');
        throw new InternalServerErrorException(
          'Unknown error while creating inspection',
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error adding inspection',
        error: error.message,
      });
    }
  }

  /**
   * @description : Provides with the list of defects for vehicle and trailer separately
   */
  @GetDefectsDecorators()
  async getDefectsList(@Res() response: Response, @Req() request: Request) {
    try {
      const defectsList = await this.tripInspectionService.getDefectsList();
      return response.status(HttpStatus.OK).send({
        message: 'Defects list fetched successfully',
        data: defectsList,
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error getting defects!',
        error: error.message,
      });
    }
  }

  /**
   * @description : Get all inspection list according to drvierId and date
   */
  @GetInspectionDecorators()
  async getInspectionList(
    @Param('driverId', MongoIdValidationPipe) driverId: string,
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      const { start: startOfDay, end: endOfDay } = getTimeZoneDateRangeForDay(
        date,
        companyTimeZone,
      );

      const options = {
        driverId: driverId,
        inspectionTime: { $gt: startOfDay, $lt: endOfDay },
        // date: date,
      };
      // const inspectionList: InspectionResponse[] = [];
      // let list: InspectionResponse[] = [];
      // Logger.log(`getInspectionList was called with params: ${driverId}`);
      let list = [];
      const inspections = await this.tripInspectionService.find(options);
      if (inspections && Object.keys(inspections).length > 0) {
        for (const inspection of inspections) {
          list.push(inspection);
        }
      }
      return response.status(HttpStatus.OK).send({
        message: 'Trip inspections found',
        data: list,
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  /**
   * @description : The update method gets two arguments, status and mechanic signatures to update the inspection record
   */
  @UpdateInspectionDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([
      // { name: 'defectImages', maxCount: 50 },
      { name: 'signatureImages', maxCount: 2 },
    ]),
  )
  async updateDefectsInspection(
    // @Body() defectRequest: InspectionRequest,
    @Body() defectRequest,
    @UploadedFiles()
    files: {
      // defectImages: Express.Multer.File[];
      signatureImages: Express.Multer.File[];
    },
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const inspectionId = params.id;
      const { tenantId, id } = request.user ?? ({ tenantId: undefined } as any);

      if (Object.keys(files).length == 0) {
        return response.status(HttpStatus.OK).send({
          message: `Mechanic's signature are required to update an inspection!`,
          data: {},
        });
      }

      defectRequest = {
        status: defectRequest.status,
        signatures: {
          mechanicSignature: {
            imageName: files.signatureImages[0].originalname,
          },
        },
      };

      Logger.log('adding image here');
      let requestInspection;
      try {
        requestInspection = await imagesUpload(
          files,
          this.awsService,
          defectRequest,
          tenantId,
          id,
          this.tripInspectionService,
        );
      } catch (error) {
        Logger.error('Error during image upload', error);
        throw new InternalServerErrorException('Image upload failed');
      }
      Logger.log('image added');

      let updateDefect;
      try {
        updateDefect = await this.tripInspectionService.updateInspection(
          inspectionId,
          requestInspection,
        );
      } catch (error) {
        Logger.error('Error updating inspection', error);
        throw new InternalServerErrorException('Updating inspection failed');
      }

      // let address = await getAddress(addDefect);
      Logger.log(`Inspection has been updated successfully`);

      if (updateDefect && Object.keys(updateDefect).length > 0) {
        Logger.log('Inspection object done');
        return response.status(HttpStatus.OK).send({
          message: 'Inspection has been updated successfully',
          data: updateDefect,
        });
      } else {
        Logger.log('Inspection updating failed');
        throw new InternalServerErrorException(
          'Unknown error while updating inspection',
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error updating inspection',
        error: error.message,
      });
    }
  }

  /**
   * @description : The endpoint will delete the inspection record
   */
  @DeleteDecorators()
  async deleteInspection(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const inspectionId = params.id;
      const deletedInspection =
        await this.tripInspectionService.deleteInspection(inspectionId);
      return response.status(HttpStatus.OK).send(deletedInspection);
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error getting defects!',
        error: error.message,
      });
    }
  }

  @GetAllInspectionDecorators()
  async getAllInspectionList(
    @Query(ListingParamsValidationPipe) queryParams: ListingParams,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      const options = {};
      const { search, orderBy, orderType, pageNo, limit } = queryParams;
      const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
      // options['$and'] = [{ tenantId: id }];
      if (search) {
        options['$or'] = [];
        iftaSearchables.forEach((attribute) => {
          options['$or'].push({ [attribute]: new RegExp(search, 'i') });
        });
      }
      const inspectionList = [];
      let list = [];

      const queryResponse = await this.tripInspectionService.findAllDvir(
        options,
        queryParams,
      );

      let total = Object.keys(queryResponse).length;
      // queryResponse = await newQuery.exec();
      if (queryResponse && Object.keys(queryResponse).length > 0) {
        for (const inspection of queryResponse) {
          list.push(inspection);
        }
      }
      return response.status(HttpStatus.OK).send({
        message: 'Trip inspections found',
        data: list,
        total,
        pageNo: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @GetByIdDecorators()
  async getInspectionById(
    @Param() param,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const inspectionId = param.id;
      const {} = request.user ?? ({ tenantId: undefined } as any);
      const inspectionList = [];
      let list = [];
      Logger.log(`getInspectionList was called`);
      const inspections = await this.tripInspectionService.findOne(
        inspectionId,
      );
      if (inspections && Object.keys(inspections).length > 0) {
        list = await getInspectionData(inspections, this.awsService);
      }
      return response.status(HttpStatus.OK).send({
        message: 'Trip inspections found',
        data: list,
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  // ######## DVIR ######### - END

  @GetInspectionDecoratorsMobile()
  async getInspectionListForDriver(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { id, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      const { start: startOfDay, end: endOfDay } = getTimeZoneDateRangeForDay(
        date,
        companyTimeZone,
      );
      const options = {
        driverId: id,
        inspectionTime: { $gt: startOfDay, $lt: endOfDay },
      };
      const inspectionList: InspectionResponse[] = [];
      let list: InspectionResponse[] = [];
      Logger.log(`getInspectionList was called with params: ${id}`);
      const inspections = await this.tripInspectionService.find(options);
      if (inspections && Object.keys(inspections).length > 0) {
        for (const inspection of inspections) {
          list.push(new InspectionResponse(inspection));
        }
      }
      return response.status(HttpStatus.OK).send({
        message: 'Trip inspections found',
        data: list,
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @DeleteDecorators()
  async deleteOffice(
    @Param('id', MongoIdValidationPipe) id: string,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    try {
      Logger.log(`delete inspection was called with params: ${id}`);
      Logger.log(
        `${req.method} request received from ${req.ip} for ${
          req.originalUrl
        } by: ${
          !response.locals.user ? 'Unauthorized User' : response.locals.user.id
        }`,
      );
      const inspection = await this.tripInspectionService.deleteOne(id);
      if (inspection && Object.keys(inspection).length > 0) {
        Logger.log(`Inspection found against ${id}`);
        return response.status(HttpStatus.OK).send({
          message: 'inspection has been deleted successfully',
        });
      } else {
        Logger.log(`inspection not found against ${id}`);
        throw new NotFoundException('inspection not found');
      }
    } catch (error) {
      Logger.error(error.message, error.stack);
      throw error;
    }
  }

  @GetReportsMobileDecorators()
  async getReportMobile(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
    @Headers('Authorization') authToken: string,
  ): Promise<any> {
    return response.status(HttpStatus.OK).send({
      message: 'Heelleellel',
    });
  }

  @GetEmailDecorator()
  async sendEmail(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Query('driverId') driverId: string,
    @Query('email') email: string,

    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    try {
      const { id, tenantId } = (request.user as any) ?? {
        tenantId: undefined,
      };
      if (!driverId) {
        driverId = id;
      }
      let unitData = await this.tripInspectionService.getUnitData(driverId);
      let companyTimeZone = unitData.homeTerminalTimeZone.tzCode;

      function previousWeekDate(dateStr) {
        // Create a new Date object from the input date string
        const date = new Date(dateStr);

        // Get the UTC values for year, month, and day
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');

        // Create a new Date object with UTC values
        const utcDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

        // Subtract 7 days from the UTC date to get the previous week's date
        utcDate.setUTCDate(utcDate.getUTCDate() - 7);

        // Get the year, month, and day of the new date object and format it as a string
        const newYear = utcDate.getUTCFullYear();
        const newMonth = (utcDate.getUTCMonth() + 1)
          .toString()
          .padStart(2, '0');
        const newDay = utcDate.getUTCDate().toString().padStart(2, '0');
        const newDateStr = `${newYear}-${newMonth}-${newDay}`;

        // Return the new date string
        return newDateStr;
      }

      let previousdate = previousWeekDate(date);
      Logger.log('previous date :  ' + previousdate);

      let logsOfSelectedDate =
        await this.tripInspectionService.getLogsBetweenRange(
          driverId,
          previousdate,
          date,
        );
      let checkDate = date.split('-');
      let todayDate = date;
      let malfunctionIndicator = 'NO';
      let unidentifiedIndicator = 'NO';
      let dataDignosticIndicator = 'NO';
      if (
        logsOfSelectedDate.data.length == 0 ||
        !unitData.hasOwnProperty('lastKnownLocation')
      ) {
        let last = 0;
        const currentDate = moment().format('YYYY-MM-DD').toString();

        //   try{
        //   if ( !(logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].date == todayDate )) {
        //     return response.status(HttpStatus.OK).send({
        //       message: 'No Data for driver found for today ',
        //       data: [],
        //     });

        //   }
        // }catch(err){
        //   return response.status(HttpStatus.OK).send({
        //     message: 'No Data for driver found for today ',
        //     data: [],
        //   });
        // }
        //    return response.status(HttpStatus.OK).send({
        //       message: 'No Record Found',
        //       data: [],
        //     });
        function formatDate(dateString) {
          var date = new Date(dateString);
          var month = (date.getMonth() + 1).toString().padStart(2, '0');
          var day = date.getDate().toString().padStart(2, '0');
          var year = date.getFullYear().toString().slice(-2);
          return month + day + year;
        }

        var formattedDate = formatDate(date);
        if (currentDate != date) {
          last = moment(formattedDate + '235900', 'MMDDYYHHmmss').unix();
        } else {
          const newtime = new Date();
          const options = {
            timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
          };
          const nowinstring = newtime.toLocaleString('en-US', options);
          const now = new Date(Date.parse(nowinstring));
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const hhmmss = hours + minutes + seconds;
          last = moment(formattedDate + hhmmss, 'MMDDYYHHmmss').unix();
        }
        let offDutyLog = [
          {
            status: 'OFF DUTY',
            startedAt: moment(formattedDate + '000000', 'MMDDYYHHmmss').unix(),
            lastStartedAt: last,
            totalSecondsSpentSoFar: 0,
            actionDate: moment(formattedDate + '000000', 'MMDDYYHHmmss').unix(),
            odoMeterMillage: 0,
            odoMeterSpeed: 0,
            engineHours: 0,
            address: '',
            vehicleManualId: unitData.manualVehicleId,
            geoLocation: {
              longitude: 0,
              latitude: 0,
              address: '',
            },
            driver: {
              id: driverId,
              firstName: unitData?.driverFirstName || '',
              lastName: unitData?.driverLastName || '',
            },
            id: '',
            violations: [],
            deviceType: 'android',
            editRequest: [],
            updated: [],
            actionType: 'OFF_DUTY',
            sequenceNumber: '0',
            notes: '',
            eventRecordStatus: '',
            eventRecordOrigin: 'Auto',
            eventType: '',
          },
        ];
        let rr = {
          date: date,
          recapData: {
            hoursWorked: {
              totalSecondsSpentSoFar: 0,
            },
            offDuty: {
              totalSecondsSpentSoFar: 1,
            },
            total: 0,
          },
        };
        let ob = [
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
        ];
        let offDutyBuffer = await generatePdf(
          offDutyLog, //according to v2
          // updatedDataGraph?.updatedGraph, // according to v1
          // recap, // according to v1
          rr, // according to v2
          [],
          unitData,
          {
            totalOffDutyTime: 0,
            totalSleeperBerthTime: 0,
            totalDrivingTime: 0,
            totalDutyTime: 0,
          }, // according to v2
          date,
          this.serviceSign,
          driverId,
          companyTimeZone,
          this.awsService,
          // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
          ob,
          252000,
          unidentifiedIndicator,
          dataDignosticIndicator,
          malfunctionIndicator,
          0,
          // usdot,// according to v2
        );
        var st = Buffer.from(offDutyBuffer).toString('base64'); //buffer.toString('base64');
        return response.status(HttpStatus.OK).send({
          message: 'Base64 string stream',
          data: st,
        });
      } else {
        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].date ==
          todayDate
        ) {
          if (
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .malfunctionsAndDiagnosticEventRecords.length != 0
          ) {
            const malfunctionAndDiagnostic =
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
                .malfunctionsAndDiagnosticEventRecords;
            malfunctionAndDiagnostic.map((item, index) => {
              if (item.eventCode == '3' || item.eventCode == '4') {
                dataDignosticIndicator = 'YES';
              }
              if (item.eventCode == '1' || item.eventCode == '2') {
                malfunctionIndicator = 'YES';
              }
            });
          }
          if (
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .eventLogListForUnidentifiedDriverProfile.length != 0
          ) {
            unidentifiedIndicator = 'YES';
          }
        } else {
          return response.status(HttpStatus.OK).send({
            message: 'No Data for driver found for today ',
            data: [],
          });
        }
      }

      // Logger.log(logsOfSelectedD2e4ate)
      // convert ICD logs to V1 logs.
      // let { resGraph, resRecap, resClock } =
      //   this.tripInspectionService.findGraph(
      //     driverId,
      //     date,
      //     tenantId,
      //     companyTimeZone,
      //   );
      function getDistance(dutyStatuses) {
        let distance = 0;
        dutyStatuses.map((element, index) => {
          distance += Number(element.accumulatedVehicleMiles);
        });
        return distance;
      }
      function getNext8Days(dateString) {
        Logger.log('Incoming date: -----------> ', dateString);
        const result = [];
        const currentDate = new Date(dateString);
        currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 in UTC

        const formattedStartDate = `${currentDate.getFullYear().toString()}-${(
          currentDate.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${currentDate
          .getUTCDate()
          .toString()
          .padStart(2, '0')}`;

        result.push(formattedStartDate);

        Logger.log('Formatted Start Date: ' + formattedStartDate);

        for (let i = 0; i < 6; i++) {
          const nextDate = new Date(currentDate);
          nextDate.setUTCDate(currentDate.getUTCDate() + (i + 1)); // Increment i by 1 to get the correct next date
          Logger.log('Next Date: ------ > ', nextDate);

          const formattedDate = `${nextDate.getFullYear().toString()}-${(
            nextDate.getUTCMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${nextDate
            .getUTCDate()
            .toString()
            .padStart(2, '0')}`;
          result.push(formattedDate);
        }

        return result;
      }

      function convertHM(value) {
        // Hours, minutes and seconds
        let ret = '';
        if (value) {
          var hrs = value / 3600;
          var mins = (value % 3600) / 60;
          // Output like "1:01" or "4:03:59" or "123:03:59"
          if (hrs > 0) {
            ret +=
              '' +
              (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) +
              ':';
          } else {
            ret += '00:';
          }
          if (mins > 0) {
            ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
          } else {
            ret += '00';
          }
        } else {
          ret = '00:00';
        }

        return ret;
      }
      let allDaysworkHour = getNext8Days(previousdate);
      Logger.log(
        'Start Date ===================================> End date  ============= >' +
          allDaysworkHour,
      );

      let object = [
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
      ];
      object.reverse();
      let totalDutyTime = 0;
      let totalMielsTrevled = getDistance(
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
          .eldEventListForDriversRecordOfDutyStatus,
      );
      logsOfSelectedDate.data.map(async (item, index) => {
        // if(item.csv.eldEventListForDriversRecordOfDutyStatus.length !=0)
        let newData = convertICDtoV1(
          logsOfSelectedDate.data[index].csv,
          driverId,
          tenantId,
          companyTimeZone,
        );
        let updatedDataGraph = await graphUpdatedData(newData);
        if (newData[newData.length - 1].status == 'ON SB') {
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        } else if (
          newData[newData.length - 1].status == 'OFF DUTY' ||
          newData[newData.length - 1].status == 'PC'
        ) {
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        } else if (
          newData[newData.length - 1].status == 'ON DUTY' ||
          newData[newData.length - 1].status == 'YM'
        ) {
          // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
          // console.log("differance : " +(newData[newData.length-1].lastStartedAt - newData[newData.length-1].startedAt) );
        } else if (newData[newData.length - 1].status == 'ON DRIVING') {
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        }
        if (allDaysworkHour.includes(item.date)) {
          let totalDutyHours =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime;
          let dateIndex = allDaysworkHour.indexOf(item.date);
          totalDutyTime += totalDutyHours;
          let eachObject = '';
          eachObject = convertHM(totalDutyHours);

          object[dateIndex] = eachObject;

          // let a = eachObject
          // console.log('df');
        }
      });
      let list: InspectionResponse[] = [];
      let inspection = await this.tripInspectionService.findInspection(
        driverId,
        date,
      );

      if (inspection && inspection.length > 0) {
        for (const item of inspection) {
          list.push(new InspectionResponse(item));
        }
      }
      // }
      // if (inspection) {
      //   list.push(new InspectionResponse(inspection));
      // }

      // if (list && list?.length > 0) {
      //   for (const entity of list) {
      //     let driverSignature = entity?.signatures?.driverSignature;
      //     if (driverSignature?.key) {
      //       let driverSignaturePath = await this.awsService.getObject(
      //         driverSignature.key,
      //       );
      //       driverSignature[
      //         'imagePath'
      //       ] = `data:image/${driverSignature.imageName
      //         .split('.')
      //         .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
      //       delete driverSignature['key'];
      //     }
      //     let mechanicSignature = entity?.signatures?.mechanicSignature;
      //     if (mechanicSignature?.key) {
      //       let driverSignaturePath = await this.awsService.getObject(
      //         mechanicSignature.key,
      //       );
      //       mechanicSignature[
      //         'imagePath'
      //       ] = `data:image/${mechanicSignature.imageName
      //         .split('.')
      //         .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
      //       delete mechanicSignature['key'];
      //     }
      //   }
      // }

      // let graph = await resGraph;
      // let sortedData = logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].csv

      let newGraph = convertICDtoV1(
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv,
        driverId,
        tenantId,
        companyTimeZone,
      );

      // let clock= logsOfSelectedDateconsole.log()
      let updatedDataGraph = await graphUpdatedData(newGraph);
      if (newGraph[newGraph.length - 1].status == 'ON SB') {
        updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'OFF DUTY' ||
        newGraph[newGraph.length - 1].status == 'PC'
      ) {
        updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'ON DUTY' ||
        newGraph[newGraph.length - 1].status == 'YM'
      ) {
        console.log(
          'before time ' + updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
        );
        updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
        console.log(
          'differance : ' +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt),
        );
      } else if (newGraph[newGraph.length - 1].status == 'ON DRIVING') {
        updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      }

      // let recap = await resRecap;

      // let recaps = Object.keys(recap);
      // let clockData = await resClock;
      // recaps.forEach((item) => {
      //   recap[item]['total'] = 0;
      //   if (recap[item].hasOwnProperty('hoursWorked')) {
      //     recap[item]['total'] +=
      //       recap[item]['hoursWorked'].totalSecondsSpentSoFar;
      //   }
      // });

      let newRecap = {
        date: date,
        recapData: {
          hoursWorked: {
            totalSecondsSpentSoFar:
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
          },
          offDuty: {
            totalSecondsSpentSoFar: 1,
          },
          total:
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
              .clockData.shiftDutySecond +
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
              .clockData.driveSeconds,
        },
      };
      totalDutyTime =
        252000 -
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
          .clockData.cycleSeconds;
      if (totalDutyTime < 0) {
        totalDutyTime = 0;
      }
      // let usdot = logsOfSelectedDate.data[0].cdv.carrierLine.carriersUSDOTNumber;
      // console.log("hdshdjsa"+logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData.driveSeconds);

      unitData.coDriverId =
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv.coDriver
          .coDriverFirstName +
        ' ' +
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv.coDriver
          .coDriverLastName;
      let buffer = await generatePdf(
        newGraph, //according to v2
        // updatedDataGraph?.updatedGraph, // according to v1
        // recap, // according to v1
        newRecap, // according to v2
        list,
        unitData,
        updatedDataGraph?.TotalTimeInHHMM, // according to v2
        date,
        this.serviceSign,
        driverId,
        companyTimeZone,
        this.awsService,
        // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
        object,
        totalDutyTime,
        unidentifiedIndicator,
        dataDignosticIndicator,
        malfunctionIndicator,
        totalMielsTrevled,
        // usdot,// according to v2
      );
      var pdfBase = Buffer.from(buffer).toString('base64'); //buffer.toString('base64');
      let reportName = 'Daily_Log_Report_' + date;
      const resp = await reportEmail(pdfBase, email, reportName);
      return response.status(HttpStatus.OK).send({
        message: resp.data,
        data: pdfBase,
      });
    } catch (err) {
      Logger.log(err);
      return response.status(HttpStatus.OK).send({
        message: 'Unable to create Daily Log report Due to Internal error ',
        data: [],
      });
    }
  }

  @GetEmail7DaysDecorator()
  async send7DaysEmail(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Query('driverId') driverId: string,
    @Query('email') email: string,

    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    const { id, tenantId } = (request.user as any) ?? {
      tenantId: undefined,
    };
    if (!driverId) {
      driverId = id;
    }
    let unitData = await this.tripInspectionService.getUnitData(driverId);
    let companyTimeZone = unitData.homeTerminalTimeZone.tzCode;
    var string = '';
    let availableDatesPDF = [];
    function previousDateWeek(dateStr) {
      // Create a new Date object from the input date string
      const date = new Date(dateStr);

      // Subtract 7 days from the date to get the previous week's date
      date.setDate(date.getDate() - 6);

      // Get the year, month, and day of the new date object and format it as a string
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const newDateStr = `${year}-${month}-${day}`;

      // Return the new date string
      return newDateStr;
    }
    let previousDate = previousDateWeek(date);
    function get8Days(dateString) {
      const result = [dateString];
      const currentDate = new Date(dateString);

      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + i);
        const formattedDate = `${nextDate.getFullYear().toString()}-${(
          nextDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;
        result.push(formattedDate);
      }

      return result;
    }
    const previousDateArray = get8Days(previousDate);
    let buffer;
    for (let i = 0; i < previousDateArray.length; i++) {
      const date = previousDateArray[i];
      let eachDayLog = await this.tripInspectionService.getLogsBetweenRange(
        driverId,
        date,
        date,
      );
      if (eachDayLog.data.length == 0) {
        // console.log(date);
      } //check today data is available
      else {
        console.log('data found');
        function previousWeekDate(dateStr) {
          // Create a new Date object from the input date string
          const date = new Date(dateStr);

          // Subtract 7 days from the date to get the previous week's date
          date.setDate(date.getDate() - 7);

          // Get the year, month, and day of the new date object and format it as a string
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const newDateStr = `${year}-${month}-${day}`;

          // Return the new date string
          return newDateStr;
        }

        let previousdate = previousWeekDate(date);
        Logger.log('previous date :  ' + previousdate);

        let logsOfSelectedDate =
          await this.tripInspectionService.getLogsBetweenRange(
            driverId,
            previousdate,
            date,
          );
        let checkDate = date.split('-');
        let todayDate = date;
        let malfunctionIndicator = 'NO';
        let unidentifiedIndicator = 'NO';
        let dataDignosticIndicator = 'NO';

        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .malfunctionsAndDiagnosticEventRecords.length != 0
        ) {
          const malfunctionAndDiagnostic =
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .malfunctionsAndDiagnosticEventRecords;
          malfunctionAndDiagnostic.map((item, index) => {
            if (item.eventCode == '3' || item.eventCode == '4') {
              dataDignosticIndicator = 'YES';
            }
            if (item.eventCode == '1' || item.eventCode == '2') {
              malfunctionIndicator = 'YES';
            }
          });
        }
        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .eventLogListForUnidentifiedDriverProfile.length != 0
        ) {
          unidentifiedIndicator = 'YES';
        }

        // Logger.log(logsOfSelectedD2e4ate)
        // convert ICD logs to V1 logs.
        // let { resGraph, resRecap, resClock } =
        //   this.tripInspectionService.findGraph(
        //     driverId,
        //     date,
        //     tenantId,
        //     companyTimeZone,
        //   );
        function getDistance(dutyStatuses) {
          let distance = 0;
          dutyStatuses.map((element, index) => {
            distance += Number(element.accumulatedVehicleMiles);
          });
          return distance;
        }
        function getNext8Days(dateString) {
          const result = [dateString];
          const currentDate = new Date(dateString);

          for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const formattedDate = `${nextDate.getFullYear().toString()}-${(
              nextDate.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}-${nextDate
              .getDate()
              .toString()
              .padStart(2, '0')}`;
            result.push(formattedDate);
          }

          return result;
        }
        function convertHM(value) {
          // Hours, minutes and seconds
          let ret = '';
          if (value) {
            var hrs = value / 3600;
            var mins = (value % 3600) / 60;
            // Output like "1:01" or "4:03:59" or "123:03:59"
            if (hrs > 0) {
              ret +=
                '' +
                (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) +
                ':';
            } else {
              ret += '00:';
            }
            if (mins > 0) {
              ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
            } else {
              ret += '00';
            }
          } else {
            ret = '00:00';
          }

          return ret;
        }
        let allDaysworkHour = getNext8Days(previousdate);
        let object = [
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
        ];
        object.reverse();
        let totalDutyTime = 0;
        let totalMielsTrevled = getDistance(
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .eldEventListForDriversRecordOfDutyStatus,
        );
        logsOfSelectedDate.data.map(async (item, index) => {
          // if(item.csv.eldEventListForDriversRecordOfDutyStatus.length !=0)
          let newData = convertICDtoV1(
            logsOfSelectedDate.data[index].csv,
            driverId,
            tenantId,
            companyTimeZone,
          );
          let updatedDataGraph = await graphUpdatedData(newData);
          if (newData[newData.length - 1].status == 'ON SB') {
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
              updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          } else if (newData[newData.length - 1].status == 'OFF DUTY') {
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
              updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          } else if (newData[newData.length - 1].status == 'ON DUTY') {
            // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
            // console.log("differance : " +(newData[newData.length-1].lastStartedAt - newData[newData.length-1].startedAt) );
          } else if (newData[newData.length - 1].status == 'ON DRIVING') {
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          }
          if (allDaysworkHour.includes(item.date)) {
            let totalDutyHours =
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime;
            let dateIndex = allDaysworkHour.indexOf(item.date);
            totalDutyTime += totalDutyHours;
            let eachObject = '';
            eachObject = convertHM(totalDutyHours);
            if (totalDutyHours != 0) {
              object[dateIndex] = eachObject;
            }
            // let a = eachObject
            // console.log('df');
          }
        });
        let list: InspectionResponse[] = [];
        let inspection = await this.tripInspectionService.findInspection(
          driverId,
          date,
        );

        if (inspection && inspection.length > 0) {
          for (const item of inspection) {
            list.push(new InspectionResponse(item));
          }
        }
        // }
        // if (inspection) {
        //   list.push(new InspectionResponse(inspection));
        // }
        if (list && list?.length > 0) {
          for (const entity of list) {
            let driverSignature = entity?.signatures?.driverSignature;
            if (driverSignature?.key) {
              let driverSignaturePath = await this.awsService.getObject(
                driverSignature.key,
              );
              driverSignature[
                'imagePath'
              ] = `data:image/${driverSignature.imageName
                .split('.')
                .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
              delete driverSignature['key'];
            }
            let mechanicSignature = entity?.signatures?.mechanicSignature;
            if (mechanicSignature?.key) {
              let driverSignaturePath = await this.awsService.getObject(
                mechanicSignature.key,
              );
              mechanicSignature[
                'imagePath'
              ] = `data:image/${mechanicSignature.imageName
                .split('.')
                .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
              delete mechanicSignature['key'];
            }
          }
        }
        // let graph = await resGraph;
        // let sortedData = logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].csv
        let newGraph = convertICDtoV1(
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv,
          driverId,
          tenantId,
          companyTimeZone,
        );

        // let clock= logsOfSelectedDateconsole.log()
        let updatedDataGraph = await graphUpdatedData(newGraph);
        if (newGraph[newGraph.length - 1].status == 'ON SB') {
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        } else if (newGraph[newGraph.length - 1].status == 'OFF DUTY') {
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        } else if (newGraph[newGraph.length - 1].status == 'ON DUTY') {
          // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
          // console.log("differance : " +(newGraph[newGraph.length-1].lastStartedAt - newGraph[newGraph.length-1].startedAt) );
        } else if (newGraph[newGraph.length - 1].status == 'ON DRIVING') {
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        }

        // let recap = await resRecap;

        // let recaps = Object.keys(recap);
        // let clockData = await resClock;
        // recaps.forEach((item) => {
        //   recap[item]['total'] = 0;
        //   if (recap[item].hasOwnProperty('hoursWorked')) {
        //     recap[item]['total'] +=
        //       recap[item]['hoursWorked'].totalSecondsSpentSoFar;
        //   }
        // });

        let newRecap = {
          date: date,
          recapData: {
            hoursWorked: {
              totalSecondsSpentSoFar:
                updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
                updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
            },
            offDuty: {
              totalSecondsSpentSoFar: 1,
            },
            total:
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
                .clockData.shiftDutySecond +
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
                .clockData.driveSeconds,
          },
        };
        // let usdot = logsOfSelectedDate.data[0].cdv.carrierLine.carriersUSDOTNumber;
        // console.log("hdshdjsa"+logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData.driveSeconds);

        unitData.coDriverId =
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .coDriver.coDriverFirstName +
          ' ' +
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .coDriver.coDriverLastName;
        buffer += await generatePdf7days(
          newGraph, //according to v2
          // updatedDataGraph?.updatedGraph, // according to v1
          // recap, // according to v1
          newRecap, // according to v2
          list,
          unitData,
          updatedDataGraph?.TotalTimeInHHMM, // according to v2
          date,
          this.serviceSign,
          driverId,
          companyTimeZone,
          this.awsService,
          // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
          object,
          totalDutyTime,
          unidentifiedIndicator,
          dataDignosticIndicator,
          malfunctionIndicator,
          totalMielsTrevled,
          // usdot,// according to v2
        );
        availableDatesPDF.push('reports' + date + '.pdf');
      } //today data  avilable
      // console.log(buffer);
    } //for loop

    // Array of PDF file paths to merge
    // const pdfPaths = ['path/to/file1.pdf', 'path/to/file2.pdf', 'path/to/file3.pdf'];

    // Create a new PDF document

    // Array of PDF file paths to merge

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Iterate over the PDF file paths
    for (const pdfPath of availableDatesPDF) {
      // Read the PDF file
      const pdfBytes = fs.readFileSync(pdfPath);

      // Load the PDF document
      const pdf = await PDFDocument.load(pdfBytes);

      // Get the number of pages in the PDF
      const pageCount = pdf.getPageCount();

      // Iterate over each page of the loaded PDF
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        // Copy each page to the merged PDF document
        const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);
        mergedPdf.addPage(copiedPage);
      }
    }

    // Save the merged PDF to a file
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync('merged.pdf', mergedPdfBytes);

    // string = Buffer.from(buffer).toString('base64'); //buffer.toString('base64');
    const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');
    if (availableDatesPDF.length > 0) {
      for (const pdfPath of availableDatesPDF) {
        // Delete each PDF file
        fs.unlink(pdfPath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${pdfPath}`, err);
          } else {
            console.log(`File deleted: ${pdfPath}`);
          }
        });
      }
    }
    let reportName = 'Daily_Log_Report_' + date;
    const resp = await reportEmail(mergedPdfBase64, email, reportName);
    return response.status(HttpStatus.OK).send({
      message: resp.data,
      data: mergedPdfBase64,
    });
  }

  @GetIFTAReport()
  async sendIFTAReport(
    // @Query('startDate') startDate: string = moment().format('YYYY-MM-DD'),
    // @Query('endDate') endDate: string = moment().format('YYYY-MM-DD'),
    // @Query('vehicles') vehiclesArr: string,
    // @Query('states') statesArr: [string],
    @Body() queryObj: any,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      const company = await firstValueFrom(
        this.unitClient.send({ cmd: 'get_company' }, tenantId),
      );
      let { startDate, endDate, vehiclesArr, states, fileName, recipient } =
        queryObj;
      let allVehiclesObject = {};
      for (let i = 0; i < vehiclesArr.length; i++) {
        const vehicleId = vehiclesArr[i];
        let vehicaleName = '';
        let unIdentified = [];
        let dutyLogs = [];
        const messagePatternUnits = await firstValueFrom(
          this.unitClient.send({ cmd: 'get_unit_by_vehicleID' }, vehicleId),
        );
        vehicaleName = messagePatternUnits[0]?.manualVehicleId;
        if (messagePatternUnits.length != 0) {
          const vinNumber = messagePatternUnits[0]?.vehicleVinNo;
          vehicaleName = messagePatternUnits[0]?.manualVehicleId;
          const drivers = [];
          for (let index = 0; index < messagePatternUnits.length; index++) {
            drivers.push(messagePatternUnits[index]?.driverId);
          }
          let allRequierdCSVs = [];
          for (let i = 0; i < drivers.length; i++) {
            let logsOfSelectedDate =
              await this.tripInspectionService.getLogsBetweenRange(
                drivers[i],
                startDate,
                endDate,
              );
            if (Array.isArray(logsOfSelectedDate.data)) {
              allRequierdCSVs.push(...logsOfSelectedDate.data);
            }
          }

          if (allRequierdCSVs.length > 0) {
            let filteredCSVs = allRequierdCSVs.filter((each) => {
              let flag = true;
              for (
                let index = 0;
                index < each.csv.cmvList.length && flag == true;
                index++
              ) {
                if (each.csv.cmvList[index].cmvVin === vinNumber) {
                  flag = false;
                }
              }
              return !flag;
            });

            filteredCSVs.map((eachCSV) => {
              let assignedUserCmvOrderNumber = '';
              eachCSV.csv.cmvList.map((eachCMV) => {
                if (eachCMV.cmvVin === vinNumber) {
                  assignedUserCmvOrderNumber =
                    eachCMV.assignedUserCmvOrderNumber;
                }
              });
              if (assignedUserCmvOrderNumber.length > 0) {
                let dutyStatusLog =
                  eachCSV.csv.eldEventListForDriversRecordOfDutyStatus.filter(
                    (eachLog) => {
                      return (
                        eachLog.correspondingCmvOrderNumber ==
                        assignedUserCmvOrderNumber
                      );
                    },
                  );
                dutyLogs.push(...dutyStatusLog);
                if (
                  eachCSV.csv.eventLogListForUnidentifiedDriverProfile.length !=
                  0
                ) {
                  let unidentifiedLogs =
                    eachCSV.csv.eventLogListForUnidentifiedDriverProfile.filter(
                      (eachLog) => {
                        return (
                          eachLog.correspondingCmvOrderNumber ==
                          assignedUserCmvOrderNumber
                        );
                      },
                    );
                  unIdentified.push(...unidentifiedLogs);
                }
              } // if that csv have any log of givien vehical
            });
          }
          // else{

          // }
        } else {
          vehicaleName = messagePatternUnits[0]?.manualVehicleId;
        }

        allVehiclesObject[vehicaleName] = [dutyLogs, unIdentified];
        console.log('dsada');
      } //vehicle arry map
      let allvehiclesMiles = {};
      let totalIdentityVeh = 0;
      let totalUnidentifiedVeh = 0;
      Object.keys(allVehiclesObject).forEach((vehicle) => {
        // console.log(kevehicley + ": " + obj[key]);
        let dutyMiles = 0;
        let unidentifyMiles = 0;
        let totalID = 0;
        let totalUID = 0;

        let obj = {};
        let eachStateArr = [];
        let count = 0;
        states.map((state) => {
          let allLogsOfState = allVehiclesObject[vehicle][0].filter(
            (eachDutyStatus) => {
              console.log(eachDutyStatus.state === state);

              return eachDutyStatus.state === state;
            },
          ); //filter each state duty logs
          let allUnidentefiedLogsOfState = allVehiclesObject[vehicle][1].filter(
            (eachDutyStatus) => {
              console.log('your issue : ', eachDutyStatus.state === state);

              return eachDutyStatus.state === state;
            },
          ); // filter each state unidentified logs
          allLogsOfState.map((each) => {
            dutyMiles += Number(each.accumulatedVehicleMiles);
            count += 1;
          });
          allUnidentefiedLogsOfState.map((each) => {
            unidentifyMiles += Number(each.accumulatedVehicleMiles);
            count += 1;
          });

          totalIdentityVeh += dutyMiles;
          totalUnidentifiedVeh += unidentifyMiles;
          totalID += dutyMiles;
          totalUID += unidentifyMiles;
          eachStateArr.push([
            state,
            dutyMiles,
            unidentifyMiles,
            dutyMiles + unidentifyMiles,
          ]);
          dutyMiles = 0;
          unidentifyMiles = 0;
        }); //itrate over each state
        if (count != 0 || vehiclesArr.length <= 1) {
          obj['data'] = eachStateArr;
        } else {
          obj['data'] = [];
        }
        obj['total'] = [totalID, totalUID, totalID + totalUID];
        allvehiclesMiles[vehicle] = { ...obj };
      }); // itrate over each vehicle
      const momentObject = moment();
      const formattedDate = momentObject.format('YYYY:MM:DD hh:mm:ss A');

      const buffer = await generateIFTA(
        formattedDate,
        startDate,
        endDate,
        company.name,
        company.address,
        company.phoneNumber,
        allvehiclesMiles,
        fileName,
      );

      function convertObjectToCSV(obj, totalIdentityVeh, totalUnidentifiedVeh) {
        let csv = 'vehicle,state,identified,unidentified,total\n';

        for (const key in obj) {
          if (obj[key].data.length > 0) {
            const vehicle = key;
            obj[key].data.forEach((row) => {
              csv += `"${vehicle}","${row[0]}",${row[1]},${row[2]},${row[3]}\n`;
            });
          }
        }
        csv += `"Total","",${totalIdentityVeh},${totalUnidentifiedVeh},${
          totalIdentityVeh + totalUnidentifiedVeh
        }\n`;
        return csv;
      }

      const reportName = fileName + ' - ' + startDate + ' - ' + endDate;
      const filePath = reportName + '.csv';

      const csv = convertObjectToCSV(
        allvehiclesMiles,
        totalIdentityVeh,
        totalUnidentifiedVeh,
      );

      const currentDateTime = moment().format('YYYY/MM/DD h:mm:ss A');

      var base64PDF = Buffer.from(buffer).toString('base64');
      console.log(csv);
      this.tripInspectionService.addIFTA({
        reportType: 'IFTA By Vehicle',
        Name: reportName,
        recipient: recipient,
        createdAt: currentDateTime,
        pdf: base64PDF,
        csv: csv,
        tenantId: tenantId,
      });

      return response.status(HttpStatus.OK).send({
        message: 'Report has been generated Successfully',
        data: [base64PDF, csv],
      });
    } catch (err) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Report was not created Due to error.',
        data: [],
      });
    }
  }

  @GetAllIFTARecords()
  async getAllIftaReports(
    @Query(ListingParamsValidationPipe) queryParams: ListingParams,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const options = {};
      const { search, orderBy, orderType, pageNo, limit } = queryParams;
      const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
      options['$and'] = [{ tenantId: id }];
      if (search) {
        options['$or'] = [];
        iftaSearchables.forEach((attribute) => {
          options['$or'].push({ [attribute]: new RegExp(search, 'i') });
        });
      }

      const query = this.tripInspectionService.getAllIFTA(options);

      if (orderBy && sortableAttributes.includes(orderBy)) {
        query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      } else {
        query.sort({ createdAt: -1 });
      }

      const total = await this.tripInspectionService.countItemsIFTA(options);

      let queryResponse;
      if (!limit || !isNaN(limit)) {
        query.skip(((pageNo ?? 1) - 1) * (limit ?? 10)).limit(limit ?? 10);
      }
      queryResponse = await query.exec();
      let data = [];
      for (let eld of queryResponse) {
        data.push(eld);
      }
      return response.status(HttpStatus.OK).send({
        data: data,
        total,
        pageNo: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @DeleteIFTA()
  async deleteIFTA(
    @Param('id', MongoIdValidationPipe) id: string,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    try {
      const ifta = await this.tripInspectionService.deleteOneIFTA(id);
      if (ifta && Object.keys(ifta).length > 0) {
        Logger.log(`Inspection found against ${id}`);
        return response.status(HttpStatus.OK).send({
          message: 'IFTA has been deleted successfully',
        });
      } else {
        Logger.log(`IFTA not found against ${id}`);
        throw new NotFoundException('IFTA not found');
      }
    } catch (error) {
      Logger.error(error.message, error.stack);
      throw error;
    }
  }
  @GetPrevious7Days()
  async get7DaysReport(
    @Query('driverId') driverId: string,

    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    const { id, tenantId } = (request.user as any) ?? {
      tenantId: undefined,
    };
    if (!driverId) {
      driverId = id;
    }
    let unitData = await this.tripInspectionService.getUnitData(driverId);
    let companyTimeZone = unitData.homeTerminalTimeZone.tzCode;
    var string = '';
    let availableDatesPDF = [];
    function previousDateWeek(dateStr) {
      // Create a new Date object from the input date string
      const date = new Date(dateStr);

      // Subtract 7 days from the date to get the previous week's date
      date.setDate(date.getDate() - 6);

      // Get the year, month, and day of the new date object and format it as a string
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const newDateStr = `${year}-${month}-${day}`;

      // Return the new date string
      return newDateStr;
    }
    let previousDate = previousDateWeek(date);
    function get8Days(dateString) {
      const result = [dateString];
      const currentDate = new Date(dateString);

      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + i);
        const formattedDate = `${nextDate.getFullYear().toString()}-${(
          nextDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;
        result.push(formattedDate);
      }

      return result;
    }
    const previousDateArray = get8Days(previousDate);
    let buffer;
    for (let i = 0; i < previousDateArray.length; i++) {
      const date = previousDateArray[i];
      let eachDayLog = await this.tripInspectionService.getLogsBetweenRange(
        driverId,
        date,
        date,
      );
      if (eachDayLog.data.length == 0) {
        console.log(date);
      } //check today data is available
      else {
        console.log('data found');
        function previousWeekDate(dateStr) {
          // Create a new Date object from the input date string
          const date = new Date(dateStr);

          // Subtract 7 days from the date to get the previous week's date
          date.setDate(date.getDate() - 7);

          // Get the year, month, and day of the new date object and format it as a string
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const newDateStr = `${year}-${month}-${day}`;

          // Return the new date string
          return newDateStr;
        }

        let previousdate = previousWeekDate(date);
        Logger.log('previous date :  ' + previousdate);

        let logsOfSelectedDate =
          await this.tripInspectionService.getLogsBetweenRange(
            driverId,
            previousdate,
            date,
          );
        let checkDate = date.split('-');
        let todayDate = date;
        let malfunctionIndicator = 'NO';
        let unidentifiedIndicator = 'NO';
        let dataDignosticIndicator = 'NO';

        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .malfunctionsAndDiagnosticEventRecords.length != 0
        ) {
          const malfunctionAndDiagnostic =
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .malfunctionsAndDiagnosticEventRecords;
          malfunctionAndDiagnostic.map((item, index) => {
            if (item.eventCode == '3' || item.eventCode == '4') {
              dataDignosticIndicator = 'YES';
            }
            if (item.eventCode == '1' || item.eventCode == '2') {
              malfunctionIndicator = 'YES';
            }
          });
        }
        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .eventLogListForUnidentifiedDriverProfile.length != 0
        ) {
          unidentifiedIndicator = 'YES';
        }

        // Logger.log(logsOfSelectedD2e4ate)
        // convert ICD logs to V1 logs.
        // let { resGraph, resRecap, resClock } =
        //   this.tripInspectionService.findGraph(
        //     driverId,
        //     date,
        //     tenantId,
        //     companyTimeZone,
        //   );
        function getDistance(dutyStatuses) {
          let distance = 0;
          dutyStatuses.map((element, index) => {
            distance += Number(element.accumulatedVehicleMiles);
          });
          return distance;
        }
        function getNext8Days(dateString) {
          const result = [dateString];
          const currentDate = new Date(dateString);

          for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const formattedDate = `${nextDate.getFullYear().toString()}-${(
              nextDate.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}-${nextDate
              .getDate()
              .toString()
              .padStart(2, '0')}`;
            result.push(formattedDate);
          }

          return result;
        }
        function convertHM(value) {
          // Hours, minutes and seconds
          let ret = '';
          if (value) {
            var hrs = value / 3600;
            var mins = (value % 3600) / 60;
            // Output like "1:01" or "4:03:59" or "123:03:59"
            if (hrs > 0) {
              ret +=
                '' +
                (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) +
                ':';
            } else {
              ret += '00:';
            }
            if (mins > 0) {
              ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
            } else {
              ret += '00';
            }
          } else {
            ret = '00:00';
          }

          return ret;
        }
        let allDaysworkHour = getNext8Days(previousdate);
        let object = [
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
        ];
        object.reverse();
        let totalDutyTime = 0;
        let totalMielsTrevled = getDistance(
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .eldEventListForDriversRecordOfDutyStatus,
        );
        logsOfSelectedDate.data.map(async (item, index) => {
          // if(item.csv.eldEventListForDriversRecordOfDutyStatus.length !=0)
          let newData = convertICDtoV1(
            logsOfSelectedDate.data[index].csv,
            driverId,
            tenantId,
            companyTimeZone,
          );
          let updatedDataGraph = await graphUpdatedData(newData);
          if (newData[newData.length - 1].status == 'ON SB') {
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
              updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          } else if (newData[newData.length - 1].status == 'OFF DUTY') {
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
              updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          } else if (newData[newData.length - 1].status == 'ON DUTY') {
            // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
            // console.log("differance : " +(newData[newData.length-1].lastStartedAt - newData[newData.length-1].startedAt) );
          } else if (newData[newData.length - 1].status == 'ON DRIVING') {
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
              (newData[newData.length - 1].lastStartedAt -
                newData[newData.length - 1].startedAt);
          }
          if (allDaysworkHour.includes(item.date)) {
            let totalDutyHours =
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime;
            let dateIndex = allDaysworkHour.indexOf(item.date);
            totalDutyTime += totalDutyHours;
            let eachObject = '';
            eachObject = convertHM(totalDutyHours);
            if (totalDutyHours != 0) {
              object[dateIndex] = eachObject;
            }
            // let a = eachObject
            // console.log('df');
          }
        });
        let list: InspectionResponse[] = [];
        let inspection = await this.tripInspectionService.findInspection(
          driverId,
          date,
        );

        if (inspection && inspection.length > 0) {
          for (const item of inspection) {
            list.push(new InspectionResponse(item));
          }
        }
        // }
        // if (inspection) {
        //   list.push(new InspectionResponse(inspection));
        // }
        if (list && list?.length > 0) {
          for (const entity of list) {
            let driverSignature = entity?.signatures?.driverSignature;
            if (driverSignature?.key) {
              let driverSignaturePath = await this.awsService.getObject(
                driverSignature.key,
              );
              driverSignature[
                'imagePath'
              ] = `data:image/${driverSignature.imageName
                .split('.')
                .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
              delete driverSignature['key'];
            }
            let mechanicSignature = entity?.signatures?.mechanicSignature;
            if (mechanicSignature?.key) {
              let driverSignaturePath = await this.awsService.getObject(
                mechanicSignature.key,
              );
              mechanicSignature[
                'imagePath'
              ] = `data:image/${mechanicSignature.imageName
                .split('.')
                .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
              delete mechanicSignature['key'];
            }
          }
        }
        // let graph = await resGraph;
        // let sortedData = logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].csv
        let newGraph = convertICDtoV1(
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv,
          driverId,
          tenantId,
          companyTimeZone,
        );

        // let clock= logsOfSelectedDateconsole.log()
        let updatedDataGraph = await graphUpdatedData(newGraph);
        if (newGraph[newGraph.length - 1].status == 'ON SB') {
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        } else if (newGraph[newGraph.length - 1].status == 'OFF DUTY') {
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        } else if (newGraph[newGraph.length - 1].status == 'ON DUTY') {
          // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
          // console.log("differance : " +(newGraph[newGraph.length-1].lastStartedAt - newGraph[newGraph.length-1].startedAt) );
        } else if (newGraph[newGraph.length - 1].status == 'ON DRIVING') {
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt);
        }

        // let recap = await resRecap;

        // let recaps = Object.keys(recap);
        // let clockData = await resClock;
        // recaps.forEach((item) => {
        //   recap[item]['total'] = 0;
        //   if (recap[item].hasOwnProperty('hoursWorked')) {
        //     recap[item]['total'] +=
        //       recap[item]['hoursWorked'].totalSecondsSpentSoFar;
        //   }
        // });

        let newRecap = {
          date: date,
          recapData: {
            hoursWorked: {
              totalSecondsSpentSoFar:
                updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
                updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
            },
            offDuty: {
              totalSecondsSpentSoFar: 1,
            },
            total:
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
                .clockData.shiftDutySecond +
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
                .clockData.driveSeconds,
          },
        };
        // let usdot = logsOfSelectedDate.data[0].cdv.carrierLine.carriersUSDOTNumber;
        // console.log("hdshdjsa"+logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData.driveSeconds);

        unitData.coDriverId =
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .coDriver.coDriverFirstName +
          ' ' +
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
            .coDriver.coDriverLastName;
        buffer += await generatePdf7days(
          newGraph, //according to v2
          // updatedDataGraph?.updatedGraph, // according to v1
          // recap, // according to v1
          newRecap, // according to v2
          list,
          unitData,
          updatedDataGraph?.TotalTimeInHHMM, // according to v2
          date,
          this.serviceSign,
          driverId,
          companyTimeZone,
          this.awsService,
          // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
          object,
          totalDutyTime,
          unidentifiedIndicator,
          dataDignosticIndicator,
          malfunctionIndicator,
          totalMielsTrevled,
          // usdot,// according to v2
        );
        availableDatesPDF.push('reports' + date + '.pdf');
      } //today data  avilable
      // console.log(buffer);
    } //for loop

    // Array of PDF file paths to merge
    // const pdfPaths = ['path/to/file1.pdf', 'path/to/file2.pdf', 'path/to/file3.pdf'];

    // Create a new PDF document

    // Array of PDF file paths to merge

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Iterate over the PDF file paths
    for (const pdfPath of availableDatesPDF) {
      // Read the PDF file
      const pdfBytes = fs.readFileSync(pdfPath);

      // Load the PDF document
      const pdf = await PDFDocument.load(pdfBytes);

      // Get the number of pages in the PDF
      const pageCount = pdf.getPageCount();

      // Iterate over each page of the loaded PDF
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        // Copy each page to the merged PDF document
        const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);
        mergedPdf.addPage(copiedPage);
      }
    }

    // Save the merged PDF to a file
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync('merged.pdf', mergedPdfBytes);

    // string = Buffer.from(buffer).toString('base64'); //buffer.toString('base64');
    const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');
    if (availableDatesPDF.length > 0) {
      for (const pdfPath of availableDatesPDF) {
        // Delete each PDF file
        fs.unlink(pdfPath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${pdfPath}`, err);
          } else {
            console.log(`File deleted: ${pdfPath}`);
          }
        });
      }
    }
    return response.status(HttpStatus.OK).send({
      message: 'Base64 string stream',
      data: mergedPdfBase64,
    });
  }

  @GetReportsDecorators()
  async getReport(
    @Query('driverId') driverId: string,

    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    try {
      const { id, tenantId } = (request.user as any) ?? {
        tenantId: undefined,
      };
      if (!driverId) {
        driverId = id;
      }
      let unitData = await this.tripInspectionService.getUnitData(driverId);
      let companyTimeZone = unitData.homeTerminalTimeZone.tzCode;

      function previousWeekDate(dateStr) {
        // Create a new Date object from the input date string
        const date = new Date(dateStr);

        // Get the UTC values for year, month, and day
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');

        // Create a new Date object with UTC values
        const utcDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

        // Subtract 7 days from the UTC date to get the previous week's date
        utcDate.setUTCDate(utcDate.getUTCDate() - 7);

        // Get the year, month, and day of the new date object and format it as a string
        const newYear = utcDate.getUTCFullYear();
        const newMonth = (utcDate.getUTCMonth() + 1)
          .toString()
          .padStart(2, '0');
        const newDay = utcDate.getUTCDate().toString().padStart(2, '0');
        const newDateStr = `${newYear}-${newMonth}-${newDay}`;

        // Return the new date string
        return newDateStr;
      }

      let previousdate = previousWeekDate(date);
      Logger.log('previous date :  ' + previousdate);

      let logsOfSelectedDate =
        await this.tripInspectionService.getLogsBetweenRange(
          driverId,
          previousdate,
          date,
        );
      let checkDate = date.split('-');
      let todayDate = date;
      let malfunctionIndicator = 'NO';
      let unidentifiedIndicator = 'NO';
      let dataDignosticIndicator = 'NO';
      if (
        logsOfSelectedDate.data.length == 0 ||
        !unitData.hasOwnProperty('lastKnownLocation')
      ) {
        let last = 0;
        const currentDate = moment().format('YYYY-MM-DD').toString();

        //   try{
        //   if ( !(logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].date == todayDate )) {
        //     return response.status(HttpStatus.OK).send({
        //       message: 'No Data for driver found for today ',
        //       data: [],
        //     });

        //   }
        // }catch(err){
        //   return response.status(HttpStatus.OK).send({
        //     message: 'No Data for driver found for today ',
        //     data: [],
        //   });
        // }
        //    return response.status(HttpStatus.OK).send({
        //       message: 'No Record Found',
        //       data: [],
        //     });
        function formatDate(dateString) {
          var date = new Date(dateString);
          var month = (date.getMonth() + 1).toString().padStart(2, '0');
          var day = date.getDate().toString().padStart(2, '0');
          var year = date.getFullYear().toString().slice(-2);
          return month + day + year;
        }

        var formattedDate = formatDate(date);
        if (currentDate != date) {
          last = moment(formattedDate + '235900', 'MMDDYYHHmmss').unix();
        } else {
          const newtime = new Date();
          const options = {
            timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
          };
          const nowinstring = newtime.toLocaleString('en-US', options);
          const now = new Date(Date.parse(nowinstring));
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const hhmmss = hours + minutes + seconds;
          last = moment(formattedDate + hhmmss, 'MMDDYYHHmmss').unix();
        }
        let offDutyLog = [
          {
            status: 'OFF DUTY',
            startedAt: moment(formattedDate + '000000', 'MMDDYYHHmmss').unix(),
            lastStartedAt: last,
            totalSecondsSpentSoFar: 0,
            actionDate: moment(formattedDate + '000000', 'MMDDYYHHmmss').unix(),
            odoMeterMillage: 0,
            odoMeterSpeed: 0,
            engineHours: 0,
            address: '',
            vehicleManualId: unitData.manualVehicleId,
            geoLocation: {
              longitude: 0,
              latitude: 0,
              address: '',
            },
            driver: {
              id: driverId,
              firstName: unitData?.driverFirstName || '',
              lastName: unitData?.driverLastName || '',
            },
            id: '',
            violations: [],
            deviceType: 'android',
            editRequest: [],
            updated: [],
            actionType: 'OFF_DUTY',
            sequenceNumber: '0',
            notes: '',
            eventRecordStatus: '',
            eventRecordOrigin: 'Auto',
            eventType: '',
          },
        ];
        let rr = {
          date: date,
          recapData: {
            hoursWorked: {
              totalSecondsSpentSoFar: 0,
            },
            offDuty: {
              totalSecondsSpentSoFar: 1,
            },
            total: 0,
          },
        };
        let ob = [
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
          '00:00',
        ];
        let offDutyBuffer = await generatePdf(
          offDutyLog, //according to v2
          // updatedDataGraph?.updatedGraph, // according to v1
          // recap, // according to v1
          rr, // according to v2
          [],
          unitData,
          {
            totalOffDutyTime: 0,
            totalSleeperBerthTime: 0,
            totalDrivingTime: 0,
            totalDutyTime: 0,
          }, // according to v2
          date,
          this.serviceSign,
          driverId,
          companyTimeZone,
          this.awsService,
          // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
          ob,
          252000,
          unidentifiedIndicator,
          dataDignosticIndicator,
          malfunctionIndicator,
          0,
          // usdot,// according to v2
        );
        var st = Buffer.from(offDutyBuffer).toString('base64'); //buffer.toString('base64');
        return response.status(HttpStatus.OK).send({
          message: 'Base64 string stream',
          data: st,
        });
      } else {
        if (
          logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].date ==
          todayDate
        ) {
          if (
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .malfunctionsAndDiagnosticEventRecords.length != 0
          ) {
            const malfunctionAndDiagnostic =
              logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
                .malfunctionsAndDiagnosticEventRecords;
            malfunctionAndDiagnostic.map((item, index) => {
              if (item.eventCode == '3' || item.eventCode == '4') {
                dataDignosticIndicator = 'YES';
              }
              if (item.eventCode == '1' || item.eventCode == '2') {
                malfunctionIndicator = 'YES';
              }
            });
          }
          if (
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
              .eventLogListForUnidentifiedDriverProfile.length != 0
          ) {
            unidentifiedIndicator = 'YES';
          }
        } else {
          return response.status(HttpStatus.OK).send({
            message: 'No Data for driver found for today ',
            data: [],
          });
        }
      }

      // Logger.log(logsOfSelectedD2e4ate)
      // convert ICD logs to V1 logs.
      // let { resGraph, resRecap, resClock } =
      //   this.tripInspectionService.findGraph(
      //     driverId,
      //     date,
      //     tenantId,
      //     companyTimeZone,
      //   );
      function getDistance(dutyStatuses) {
        let distance = 0;
        dutyStatuses.map((element, index) => {
          distance += Number(element.accumulatedVehicleMiles);
        });
        return distance;
      }
      function getNext8Days(dateString) {
        Logger.log('Incoming date: -----------> ', dateString);
        const result = [];
        const currentDate = new Date(dateString);
        currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 in UTC

        const formattedStartDate = `${currentDate.getFullYear().toString()}-${(
          currentDate.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${currentDate
          .getUTCDate()
          .toString()
          .padStart(2, '0')}`;

        result.push(formattedStartDate);

        Logger.log('Formatted Start Date: ' + formattedStartDate);

        for (let i = 0; i < 6; i++) {
          const nextDate = new Date(currentDate);
          nextDate.setUTCDate(currentDate.getUTCDate() + (i + 1)); // Increment i by 1 to get the correct next date
          Logger.log('Next Date: ------ > ', nextDate);

          const formattedDate = `${nextDate.getFullYear().toString()}-${(
            nextDate.getUTCMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${nextDate
            .getUTCDate()
            .toString()
            .padStart(2, '0')}`;
          result.push(formattedDate);
        }

        return result;
      }

      function convertHM(value) {
        // Hours, minutes and seconds
        let ret = '';
        if (value) {
          var hrs = value / 3600;
          var mins = (value % 3600) / 60;
          // Output like "1:01" or "4:03:59" or "123:03:59"
          if (hrs > 0) {
            ret +=
              '' +
              (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) +
              ':';
          } else {
            ret += '00:';
          }
          if (mins > 0) {
            ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
          } else {
            ret += '00';
          }
        } else {
          ret = '00:00';
        }

        return ret;
      }
      let allDaysworkHour = getNext8Days(previousdate);
      Logger.log(
        'Start Date ===================================> End date  ============= >' +
          allDaysworkHour,
      );

      let object = [
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
      ];
      object.reverse();
      let totalDutyTime = 0;
      let totalMielsTrevled = getDistance(
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv
          .eldEventListForDriversRecordOfDutyStatus,
      );
      logsOfSelectedDate.data.map(async (item, index) => {
        // if(item.csv.eldEventListForDriversRecordOfDutyStatus.length !=0)
        let newData = convertICDtoV1(
          logsOfSelectedDate.data[index].csv,
          driverId,
          tenantId,
          companyTimeZone,
        );
        let updatedDataGraph = await graphUpdatedData(newData);
        if (newData[newData.length - 1].status == 'ON SB') {
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
            updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        } else if (
          newData[newData.length - 1].status == 'OFF DUTY' ||
          newData[newData.length - 1].status == 'PC'
        ) {
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        } else if (
          newData[newData.length - 1].status == 'ON DUTY' ||
          newData[newData.length - 1].status == 'YM'
        ) {
          // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
          // console.log("differance : " +(newData[newData.length-1].lastStartedAt - newData[newData.length-1].startedAt) );
        } else if (newData[newData.length - 1].status == 'ON DRIVING') {
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
            (newData[newData.length - 1].lastStartedAt -
              newData[newData.length - 1].startedAt);
        }
        if (allDaysworkHour.includes(item.date)) {
          let totalDutyHours =
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime;
          let dateIndex = allDaysworkHour.indexOf(item.date);
          totalDutyTime += totalDutyHours;
          let eachObject = '';
          eachObject = convertHM(totalDutyHours);

          object[dateIndex] = eachObject;

          // let a = eachObject
          // console.log('df');
        }
      });
      let list: InspectionResponse[] = [];
      let inspection = await this.tripInspectionService.findInspection(
        driverId,
        date,
      );

      if (inspection && inspection.length > 0) {
        for (const item of inspection) {
          list.push(new InspectionResponse(item));
        }
      }
      // }
      // if (inspection) {
      //   list.push(new InspectionResponse(inspection));
      // }

      // if (list && list?.length > 0) {
      //   for (const entity of list) {
      //     let driverSignature = entity?.signatures?.driverSignature;
      //     if (driverSignature?.key) {
      //       let driverSignaturePath = await this.awsService.getObject(
      //         driverSignature.key,
      //       );
      //       driverSignature[
      //         'imagePath'
      //       ] = `data:image/${driverSignature.imageName
      //         .split('.')
      //         .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
      //       delete driverSignature['key'];
      //     }
      //     let mechanicSignature = entity?.signatures?.mechanicSignature;
      //     if (mechanicSignature?.key) {
      //       let driverSignaturePath = await this.awsService.getObject(
      //         mechanicSignature.key,
      //       );
      //       mechanicSignature[
      //         'imagePath'
      //       ] = `data:image/${mechanicSignature.imageName
      //         .split('.')
      //         .pop()};base64,${driverSignaturePath.replace(/\s+/g, '')}`;
      //       delete mechanicSignature['key'];
      //     }
      //   }
      // }

      // let graph = await resGraph;
      // let sortedData = logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].csv

      let newGraph = convertICDtoV1(
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv,
        driverId,
        tenantId,
        companyTimeZone,
      );

      // let clock= logsOfSelectedDateconsole.log()
      let updatedDataGraph = await graphUpdatedData(newGraph);
      if (newGraph[newGraph.length - 1].status == 'ON SB') {
        updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'OFF DUTY' ||
        newGraph[newGraph.length - 1].status == 'PC'
      ) {
        updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'ON DUTY' ||
        newGraph[newGraph.length - 1].status == 'YM'
      ) {
        console.log(
          'before time ' + updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
        );
        updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
        console.log(
          'differance : ' +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt),
        );
      } else if (newGraph[newGraph.length - 1].status == 'ON DRIVING') {
        updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      }

      // let recap = await resRecap;

      // let recaps = Object.keys(recap);
      // let clockData = await resClock;
      // recaps.forEach((item) => {
      //   recap[item]['total'] = 0;
      //   if (recap[item].hasOwnProperty('hoursWorked')) {
      //     recap[item]['total'] +=
      //       recap[item]['hoursWorked'].totalSecondsSpentSoFar;
      //   }
      // });

      let newRecap = {
        date: date,
        recapData: {
          hoursWorked: {
            totalSecondsSpentSoFar:
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
          },
          offDuty: {
            totalSecondsSpentSoFar: 1,
          },
          total:
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
              .clockData.shiftDutySecond +
            logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
              .clockData.driveSeconds,
        },
      };
      totalDutyTime =
        252000 -
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].meta
          .clockData.cycleSeconds;
      if (totalDutyTime < 0) {
        totalDutyTime = 0;
      }
      // let usdot = logsOfSelectedDate.data[0].cdv.carrierLine.carriersUSDOTNumber;
      // console.log("hdshdjsa"+logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData.driveSeconds);

      unitData.coDriverId =
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv.coDriver
          .coDriverFirstName +
        ' ' +
        logsOfSelectedDate.data[logsOfSelectedDate.data.length - 1].csv.coDriver
          .coDriverLastName;
      let buffer = await generatePdf(
        newGraph, //according to v2
        // updatedDataGraph?.updatedGraph, // according to v1
        // recap, // according to v1
        newRecap, // according to v2
        list,
        unitData,
        updatedDataGraph?.TotalTimeInHHMM, // according to v2
        date,
        this.serviceSign,
        driverId,
        companyTimeZone,
        this.awsService,
        // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
        object,
        totalDutyTime,
        unidentifiedIndicator,
        dataDignosticIndicator,
        malfunctionIndicator,
        totalMielsTrevled,
        // usdot,// according to v2
      );
      var string = Buffer.from(buffer).toString('base64'); //buffer.toString('base64');
      return response.status(HttpStatus.OK).send({
        message: 'Base64 string stream',
        data: string,
      });
    } catch (err) {
      Logger.log(err);
      return response.status(HttpStatus.OK).send({
        message: 'Request Failed in any level.',
        data: '',
      });
    }
  }

  @UpdateInspectionDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'defectImages', maxCount: 50 },
      { name: 'signatureImages', maxCount: 2 },
    ]),
  )
  async UpdateDefectsInspection(
    @Body() defectRequest: InspectionRequest,
    @Param('id', MongoIdValidationPipe) inspectionReportId: string,
    @UploadedFiles()
    files: {
      defectImages: Express.Multer.File[];
      signatureImages: Express.Multer.File[];
    },
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId, id, vehicleId, homeTerminalAddress, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      defectRequest.tenantId = tenantId;
      defectRequest.driverId = id;
      defectRequest.vehicleId = vehicleId;
      defectRequest.officeId = homeTerminalAddress;
      let requestInspection = await imagesUpload(
        files,
        this.awsService,
        defectRequest,
        tenantId,
        id,
        this.tripInspectionService,
      );
      let unitData = await this.tripInspectionService.getUnitData(id);
      requestInspection.vehicleManualId = unitData.manualVehicleId;
      requestInspection.trailerNumber = unitData.trailerNumber;
      const addDefect = await this.tripInspectionService.updateInspection(
        inspectionReportId,
        requestInspection,
      );
      // let address = await getAddress(addDefect);
      if (addDefect && Object.keys(addDefect).length > 0) {
        Logger.log(`Inspection has been updated successfully`);
        return response.status(HttpStatus.OK).send({
          message: 'Inspection has been updated successfully',
        });
      } else {
        Logger.log(`Inspection not updated`);
        throw new InternalServerErrorException(
          `unknown error while updating inspection`,
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  @UpdateLogFormMobileDecorators()
  @UseInterceptors(FileInterceptor('driverSign'))
  async UpdateDriverSign(
    @UploadedFile() driverSign: Express.Multer.File,
    @Body() logFormRequest: LogFormRequest,
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId, id, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      logFormRequest.tenantId = tenantId;
      let requestLog = await signUpload(
        driverSign,
        this.awsService,
        logFormRequest,
        tenantId,
        id,
      );
      if (logFormRequest.trailerNumber || logFormRequest.shippingDocument) {
        const trilers = logFormRequest.trailerNumber + '';
        const shipings = logFormRequest.shippingDocument + '';
        requestLog.trailerNumber = JSON.parse(trilers);
        requestLog.shippingDocument = JSON.parse(shipings);
      }
      let logResult = await this.serviceSign.UpdateLogForm(
        requestLog,
        id,
        date,
        true,
        companyTimeZone,
      );
      if (requestLog?.sign) {
        const signature = JSON.parse(JSON.stringify(requestLog.sign));
        const imageUrl = signature.imageUrl;
        Logger.log(signature.imageUrl);
        // let address = await getAddress(addDefect);
        const messagePatternUnits =
          await firstValueFrom<MessagePatternResponseType>(
            this.unitClient.send({ cmd: 'update_image_URL' }, { id, imageUrl }),
          );
        if (messagePatternUnits.isError) {
          mapMessagePatternResponseToException(messagePatternUnits);
        }
      }
      if (logResult && Object.keys(logResult).length > 0) {
        Logger.log(`Log Form has been updated successfully`);
        return response.status(HttpStatus.OK).send({
          message: 'Log Form has been updated successfully',
        });
      } else {
        Logger.log(`Inspection not updated`);
        throw new InternalServerErrorException(
          `unknown error while updating inspection`,
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  @certificationMobileDecorators()
  @UseInterceptors(FileInterceptor('driverSign'))
  async addCertificationMobile(
    @UploadedFile() driverSign: Express.Multer.File,
    @Body() logFormRequest: LogFormRequest,
    @Query('date') date: string,
    @Query('time') time: string,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId, id, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      logFormRequest.tenantId = tenantId;
      let givenDates = date.split(',');
      let requestLog = await signUpload(
        driverSign,
        this.awsService,
        logFormRequest,
        tenantId,
        id,
      );
      // requestLog.trailerNumber = JSON.parse(JSON.stringify(requestLog.trailerNumber));
      // requestLog.shippingDocument = JSON.parse(JSON.stringify(requestLog.shippingDocument));

      let logResult = await this.serviceSign.UpdateLogForm(
        requestLog,
        id,
        givenDates[0],
        true,
        companyTimeZone,
      );
      let signature;
      if (requestLog?.sign) {
        signature = JSON.parse(JSON.stringify(requestLog.sign));
        const imageUrl = signature.imageUrl;
        Logger.log(signature.imageUrl);
        // let address = await getAddress(addDefect);
        const messagePatternUnits =
          await firstValueFrom<MessagePatternResponseType>(
            this.unitClient.send({ cmd: 'update_image_URL' }, { id, imageUrl }),
          );
        if (messagePatternUnits.isError) {
          mapMessagePatternResponseToException(messagePatternUnits);
        }
      }

      let isCertified = await this.tripInspectionService.certification(
        id,
        givenDates,
        companyTimeZone,
        time,
        signature.imageUrl,
      );
      if (isCertified) {
        let messagePatternDriver;
        messagePatternDriver = await firstValueFrom<MessagePatternResponseType>(
          this.driverClient.send({ cmd: 'get_driver_by_id' }, id),
        );
        if (messagePatternDriver?.isError) {
          mapMessagePatternResponseToException(messagePatternDriver);
        }
        const user = messagePatternDriver?.data;
        let SpecificClient = user?.client;

        // call message pattern here

        const notificationObj = {
          logs: [],
          dateTime: '',
          notificationType: 4,
          driverId: id,
          editStatusFromBO: 'save',
        };
        const deviceInfo = {
          deviceToken: user?.deviceToken,
          deviceType: user?.deviceType,
        };
        const isSilent = true;
        this.tripInspectionService.notifyDriver(
          SpecificClient,
          user,
          givenDates[0],
          notificationObj,
        );

        // END notification handler

        return response.status(HttpStatus.OK).send({
          message: 'Certification is added successfully  ',
          data: givenDates,
        });
      } else {
        return response.status(HttpStatus.OK).send({
          message: 'Certification is not added Succefully  ',
          data: givenDates,
        });
      }
      // if (logResult && Object.keys(logResult).length > 0) {
      //   Logger.log(`Log Form has been updated successfully`);
      //   return response.status(HttpStatus.OK).send({
      //     message: 'Log Form has been updated successfully',
      //   });
      // } else {
      //   Logger.log(`Inspection not updated`);
      //   throw new InternalServerErrorException(
      //     `unknown error while updating inspection`,
      //   );
      // }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }
  @UpdateLogFormDecorators()
  @UseInterceptors(FileInterceptor('driverSign'))
  async UpdateDriverLogFrom(
    @UploadedFile() driverSign: Express.Multer.File,
    @Body() logFormRequest: LogFormRequest,
    @Param('driverId', MongoIdValidationPipe) driverId: string,
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      logFormRequest.tenantId = tenantId;
      let requestLog = await signUpload(
        driverSign,
        this.awsService,
        logFormRequest,
        tenantId,
        driverId,
      );
      if (logFormRequest.trailerNumber || logFormRequest.shippingDocument) {
        const trilers = logFormRequest.trailerNumber + '';
        const shipings = logFormRequest.shippingDocument + '';
        requestLog.trailerNumber = JSON.parse(trilers);
        requestLog.shippingDocument = JSON.parse(shipings);
      }

      let logResult = await this.serviceSign.UpdateLogForm(
        requestLog,
        driverId,
        date,
        true,
        companyTimeZone,
      );
      // let address = await getAddress(addDefect);
      if (logResult && Object.keys(logResult).length > 0) {
        Logger.log(`Log Form has been updated successfully`);
        return response.status(HttpStatus.OK).send({
          message: 'Log form has been updated successfully',
        });
      } else {
        Logger.log(`Log form not updated`);
        throw new InternalServerErrorException(
          `unknown error while updating log form`,
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  @GetLogFormDecoratorMobile()
  async getLogFormByIdMobile(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { id, tenantId, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      Logger.log(`getInspectionList was called`);
      let logsOfSelectedDate =
        await this.tripInspectionService.getLogsBetweenRange(id, date, date);
      let logFormData = await getLogsFormData(
        date,
        id,
        this.tripInspectionService,
        this.serviceSign,
        this.awsService,
        tenantId,
        companyTimeZone,
      );
      let data = logFormData?.logForm;
      // if(logFormData.notPresentLogform){
      //  const requestLog: LogFormRequest = new LogFormRequest();
      //  requestLog.shippingDocument = (data as any)?.shippingDocument
      //  requestLog.trailerNumber = (data as any)?.trailerNumber
      //  requestLog.homeTerminalAddress = (data as any)?.homeTerminalAddress
      //  let logResult = await this.serviceSign.UpdateLogForm(
      //    requestLog,
      //    id,
      //    date,
      //    true,
      //    companyTimeZone,
      //  );
      //  console.log(logResult)
      // }
      if (
        logsOfSelectedDate.data[0]?.csv
          ?.eldEventListForDriverCertificationOfOwnRecords.length == 0
      ) {
        if ('sign' in data) {
          delete data.sign;
        }
        return response.status(HttpStatus.OK).send({
          message: 'Log form data found',
          data: data ?? {},
        });
      } else {
        return response.status(HttpStatus.OK).send({
          message: 'Log form data found',
          data: data ?? {},
        });
      }
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @GetAllSubmittedRecords()
  async getAllSubmittedRecords(
    @Query(ListingParamsValidationPipe) queryParams: ListingParams,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const options = {};
      const { search, orderBy, orderType, pageNo, limit } = queryParams;
      const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);

      let isActive = queryParams.isActive;
      let arr = [];
      arr.push(isActive);
      if (arr.includes('true')) {
        isActive = true;
      } else {
        isActive = false;
      }

      if (search) {
        options['$or'] = [];
        searchableAttributes.forEach((attribute) => {
          options['$or'].push({ [attribute]: new RegExp(search, 'i') });
        });

        if (arr[0]) {
          options['$and'] = [];
          isActiveinActive.forEach((attribute) => {
            options['$and'].push({ [attribute]: isActive });
          });
        }
      } else {
        if (arr[0]) {
          options['$or'] = [];
          isActiveinActive.forEach((attribute) => {
            options['$or'].push({ [attribute]: isActive });
          });
        }
      }
      // if(options.hasOwnProperty('$and')){
      //   options['$and'].push({tenantId:id})

      // }else{
      //   options['$and'] = [{tenantId:id}];

      // }
      const query = this.tripInspectionService.getAll(options);

      if (orderBy && sortableAttributes.includes(orderBy)) {
        query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      } else {
        query.sort({ createdAt: -1 });
      }

      const total = await this.tripInspectionService.countItems(options);

      let queryResponse;
      if (!limit || !isNaN(limit)) {
        query.skip(((pageNo ?? 1) - 1) * (limit ?? 10)).limit(limit ?? 10);
      }
      queryResponse = await query.exec();
      let data = [];
      for (let eld of queryResponse) {
        data.push(eld);
      }
      return response.status(HttpStatus.OK).send({
        data: data,
        total,
        pageNo: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @GetLogFormDecorator()
  async getLogFormById(
    @Query('date') date: string = moment().format('YYYY-MM-DD'),
    @Param('driverId') driverId: string,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { id, tenantId, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);
      Logger.log(`getInspectionList was called`);
      let logFormData = await getLogsFormData(
        date,
        driverId,
        this.tripInspectionService,
        this.serviceSign,
        this.awsService,
        tenantId,
        companyTimeZone,
      );
      let data = logFormData?.logForm;
      Logger.log('Massege PAttern True \n\n\n' + logFormData.notPresentLogform);
      // if(logFormData.notPresentLogform){
      //   Logger.log("In IF")
      //  const requestLog: LogFormRequest = new LogFormRequest();
      //  requestLog.shippingDocument = (data as any)?.shippingDocument
      //  requestLog.trailerNumber = (data as any)?.trailerNumber
      //  requestLog.homeTerminalAddress = (data as any)?.homeTerminalAddress
      //  let logResult = await this.serviceSign.UpdateLogForm(
      //    requestLog,
      //    driverId,
      //    date,
      //    true,
      //    companyTimeZone,
      //  );
      // //  console.log(logResult)
      // }
      let logsOfSelectedDate =
        await this.tripInspectionService.getLogsBetweenRange(
          driverId,
          date,
          date,
        );
      const csvOfDate = logsOfSelectedDate.data[0];
      const csvDataOfDutyStatus =
        csvOfDate.csv.eldEventListForDriversRecordOfDutyStatus; // get all the duty statuses
      csvDataOfDutyStatus.sort((a, b) =>
        a.eventTime.localeCompare(b.eventTime),
      );

      let shippingIds = [];
      let trailerIds = [];
      csvDataOfDutyStatus.forEach((record) => {
        if (!shippingIds.includes(record.shippingId)) {
          shippingIds.push(record.shippingId);
        }
        if (!trailerIds.includes(record.trailerId)) {
          trailerIds.push(record.trailerId);
        }
      });
      Logger.log('before shipping doc');
      data['shippingDocument'] = shippingIds;
      data['trailerNumber'] = trailerIds;
      Logger.log('after shipping doc');

      if (
        logsOfSelectedDate.data[0]?.csv
          ?.eldEventListForDriverCertificationOfOwnRecords.length == 0
      ) {
        if ('sign' in data) {
          delete data.sign;
        }
        return response.status(HttpStatus.OK).send({
          message: 'Log form data found',
          data: data ?? {},
        });
      } else {
        return response.status(HttpStatus.OK).send({
          message: 'Log form data found',
          data: data ?? {},
        });
      }
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @GetCsvDecorator()
  async getCsvFileDriverById(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string = moment().format('YYYY-MM-DD'),
    @Query('origin') origin: string,
    @Query('investigationCode') investigationCode: string,

    @Query('driverId') driverIdArr: [string],
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      investigationCode = investigationCode.trim();
      if (!dateStart) {
        dateStart = moment(dateEnd).subtract(8, 'd').format('YYYY-MM-DD');
      } else {
        dateStart = moment(dateStart).format('YYYY-MM-DD');
      }
      let fileRes = [];
      let driverIdArrItrator = [];
      const { id, tenantId, companyTimeZone } =
        request.user ?? ({ tenantId: undefined } as any);

      if (!driverIdArr) {
        driverIdArrItrator.push(id);
      } else {
        driverIdArrItrator = driverIdArr;
      }
      for (let driverId of driverIdArrItrator) {
        let logsOfSelectedDate =
          await this.tripInspectionService.getLogsBetweenRange(
            driverId,
            dateStart,
            dateEnd,
          );
        if (logsOfSelectedDate.data.length == 0) {
          return response.status(404).send({
            message: 'No, record found there.',
          });
        }
        let finalCsv = logsOfSelectedDate.data[0].csv;
        finalCsv.eldFileHeaderSegment.outputFileComment =
          investigationCode.trim();
        let stringOfEldLine = '';
        Object.keys(finalCsv.eldFileHeaderSegment).map((item) => {
          if (item != 'lineDataCheckValue') {
            stringOfEldLine += finalCsv.eldFileHeaderSegment[item];
          }
        });
        let result = checkSum(stringOfEldLine);
        finalCsv.eldFileHeaderSegment.lineDataCheckValue = result.hexa;
        logsOfSelectedDate.data.forEach((singleDay, index) => {
          if (index != 0) {
            finalCsv.eventAnnotationsCommentsAndDriverLocation.push(
              ...singleDay.csv.eventAnnotationsCommentsAndDriverLocation,
            );
            finalCsv.eldEventListForDriverCertificationOfOwnRecords.push(
              ...singleDay.csv.eldEventListForDriverCertificationOfOwnRecords,
            );
            finalCsv.malfunctionsAndDiagnosticEventRecords.push(
              ...singleDay.csv.malfunctionsAndDiagnosticEventRecords,
            );
            finalCsv.eventLogListForUnidentifiedDriverProfile.push(
              ...singleDay.csv.eventLogListForUnidentifiedDriverProfile,
            );
            finalCsv.eldEventListForDriversRecordOfDutyStatus.push(
              ...singleDay.csv.eldEventListForDriversRecordOfDutyStatus,
            );
            finalCsv.eldLoginLogoutReport.push(
              ...singleDay.csv.eldLoginLogoutReport,
            );
            finalCsv.cmvEnginePowerUpShutDownActivity.push(
              ...singleDay.csv.cmvEnginePowerUpShutDownActivity,
            );
          }
        });
        let driverCertification = [];
        await finalCsv.eldEventListForDriverCertificationOfOwnRecords.forEach(
          (element) => {
            driverCertification.push(getCertificationCheck(element));
          },
        );
        finalCsv.eldEventListForDriverCertificationOfOwnRecords =
          driverCertification;

        let malfuntion = [];
        await finalCsv.malfunctionsAndDiagnosticEventRecords.forEach(
          (element) => {
            malfuntion.push(getEventsCheckSum(element));
          },
        );
        finalCsv.malfunctionsAndDiagnosticEventRecords = malfuntion;

        let powerUpDown = [];
        await finalCsv.cmvEnginePowerUpShutDownActivity.forEach((element) => {
          powerUpDown.push(getEventPower(element));
        });
        finalCsv.cmvEnginePowerUpShutDownActivity = powerUpDown;

        let unidentified = [];
        await finalCsv.eventLogListForUnidentifiedDriverProfile.forEach(
          (element) => {
            unidentified.push(getUnidentifiedcheckSum(element));
          },
        );
        finalCsv.eventLogListForUnidentifiedDriverProfile = unidentified;

        let loginLogout = [];
        await finalCsv.eldLoginLogoutReport.forEach((element) => {
          loginLogout.push(getEventsCheckSum(element));
        });
        finalCsv.eldLoginLogoutReport = loginLogout;

        let dutyStatusesArray = [];
        await finalCsv.eldEventListForDriversRecordOfDutyStatus.forEach(
          (element) => {
            dutyStatusesArray.push(getLogChecksum(element));
          },
        );
        dutyStatusesArray.sort((a, b) => {
          const dateA = a.eventTime;
          const dateB = b.eventTime;
          return dateA.localeCompare(dateB);
        });
        dutyStatusesArray.reverse();
        finalCsv.eldEventListForDriversRecordOfDutyStatus = dutyStatusesArray;
        let stringOfTimePlaceLine = '';
        Object.keys(finalCsv.timePlaceLine).map((item) => {
          if (
            item != 'eventDataCheckValue' &&
            item != 'lineDataCheckValue' &&
            item != 'notes' &&
            item != 'address' &&
            item != 'eventEndTime' &&
            item != 'currentEventCode' &&
            item != 'currentEventType' &&
            item != 'totalVehicleMilesDutyStatus' &&
            item != 'totalEngineHoursDutyStatus' &&
            item != 'speed' &&
            item != 'distance' &&
            item != 'duration' &&
            item != 'origin' &&
            item != 'destination' &&
            item != 'vehicleId' &&
            item != 'eventSynced' &&
            item != 'startEngineHour' &&
            item != 'endEngineHour' &&
            item != 'startVehicleMiles' &&
            item != 'endVehicleMiles' &&
            item != 'state' &&
            item != 'SHIFT_START_DATE' &&
            item != 'CYCLE_START_DATE' &&
            item != 'violation'
          ) {
            stringOfTimePlaceLine += finalCsv.timePlaceLine[item];
          }
        });
        let resultofTimePlaceLine = checkSum(stringOfTimePlaceLine);
        finalCsv.timePlaceLine.lineDataCheckValue = resultofTimePlaceLine.hexa;

        finalCsv.eventAnnotationsCommentsAndDriverLocation.map(
          (element, index) => {
            let stringOfEventAnnotation = '';

            Object.keys(element).map((item) => {
              if (
                item != 'eventDataCheckValue' &&
                item != 'lineDataCheckValue' &&
                item != 'notes' &&
                item != 'address' &&
                item != 'eventEndTime' &&
                item != 'currentEventCode' &&
                item != 'totalVehicleMilesDutyStatus' &&
                item != 'totalEngineHoursDutyStatus' &&
                item != 'speed' &&
                item != 'distance' &&
                item != 'duration' &&
                item != 'origin' &&
                item != 'destination' &&
                item != 'vehicleId' &&
                item != 'eventSynced' &&
                item != 'startEngineHour' &&
                item != 'endEngineHour' &&
                item != 'startVehicleMiles' &&
                item != 'endVehicleMiles' &&
                item != 'state' &&
                item != 'violation'
              ) {
                stringOfEventAnnotation += element[item];
              }
              if (item == 'eventDataCheckValue') {
                delete element.eventDataCheckValue;
              }
            });
            let resultofEventAnnotation = checkSum(stringOfEventAnnotation);
            finalCsv.eventAnnotationsCommentsAndDriverLocation[
              index
            ].lineDataCheckValue = resultofEventAnnotation.hexa;
          },
        );
        let decimal = 0;
        let checkValue;
        Object.keys(finalCsv).map((item) => {
          if (Array.isArray(finalCsv[item])) {
            finalCsv[item].forEach((element, index) => {
              checkValue = finalCsv[item][index].lineDataCheckValue;
              decimal += parseInt(checkValue, 16);
            });
          } else if (!Array.isArray(finalCsv[item])) {
            if (item !== 'fileDataCheckLine') {
              checkValue = finalCsv[item].lineDataCheckValue;

              decimal += parseInt(checkValue, 16);
            }
          }
        });

        finalCsv.fileDataCheckLine.fileDataCheckValue = fileCheckData(decimal);
        let current = moment().unix();
        let res = await getArrayData(finalCsv);
        let resultString = '';
        for (let line of res) {
          resultString += line + '\r';
        }
        let fileName = fileNameCreation(
          finalCsv.driver.lastName,
          finalCsv.driver.driverLicenseNumber,
          dateFormat(current, companyTimeZone),
          timeFormat(current, companyTimeZone),
        );

        let resFmcsa = await fmcsaCall(
          resultString,
          investigationCode.trim(),
          fileName,
        );

        //this part here is just to add validation on csv data
        //please test it by cahnging vin or carrier name
        let flag = await isValidVin(
          finalCsv.cmvList[finalCsv.cmvList.length - 1].cmvVin,
        );
        resFmcsa['warning'] = [];
        if (!flag) {
          resFmcsa.warning.push(
            'contains 17 characters. only contains capital letters and numbers. does not contain the characters I, O, or Q',
          );
        }
        let carrierValidation = await isValidCarrierName(
          finalCsv.carrierLine.carrierName,
        );
        if (carrierValidation.length != 0) {
          resFmcsa.warning.push(carrierValidation);
        }
        // validation part ends here
        let driverName =
          finalCsv.driver.firstName + ' ' + finalCsv.driver.lastName;
        fileRes.push(resFmcsa); // call for .net service to submit csv on fmcsa web portal.
        let now = new Date();
        this.tripInspectionService.addReportSubmitTable({
          origin: origin ? origin : 'mobile',
          eRODScode: investigationCode.trim(),
          driver: driverName,
          dateStart: dateStart,
          dateEnd: dateEnd,
          status: resFmcsa.errorCount,
          createdTime: now.toString(),
          submissionID: resFmcsa.submissionId,
          errors: resFmcsa.errors,
          warnings: resFmcsa.warning,
          tenantId: tenantId,
        });
        if (!fs.existsSync('./CSVList')) {
          fs.mkdirSync('./CSVList');
        }
        let data = fs.writeFileSync(
          './CSVList/' + fileName + '.csv',
          resultString,
        );
      }
      return response.status(HttpStatus.OK).send({
        message: 'Report sent successfully',
        data: fileRes,
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }
  @GetCsvString()
  async GetCsvString(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string = moment().format('YYYY-MM-DD'),
    @Query('origin') origin: string,
    @Query('investigationCode') investigationCode: string,

    @Query('driverId') driverIdArr: [string],
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      return response.status(HttpStatus.OK).send({
        message: 'Csv file genrated successfully',
        data: 'this api is no longer required that why added comment',
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @sendEmailToFmcsa()
  async sendEmailToFmcsa(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string = moment().format('YYYY-MM-DD'),
    @Query('origin') origin: string,
    @Query('investigationCode') investigationCode: string,

    @Query('driverId') driverIdArr: [string],
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      return response.status(HttpStatus.OK).send({
        message: 'Csv file sent to FMCSA successfully',
        data: 'this api is no longer required that why added comment',
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }
  @GetCertificationDays()
  async getunCertificationDays(
    @Query('dateStart') dateStart: string = moment().format('YYYY-MM-DD'),
    @Query('dateEnd') dateEnd: string = moment().format('YYYY-MM-DD'),
    @Query('driverId') driverId: string,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    let logsOfSelectedDate =
      await this.tripInspectionService.getLogsBetweenRange(
        driverId,
        dateStart,
        dateEnd,
      );

    let dates = [];
    if (logsOfSelectedDate.data.length > 0) {
      logsOfSelectedDate.data.map((element) => {
        if (
          element.csv.eldEventListForDriverCertificationOfOwnRecords.length == 0
        ) {
          dates.push(element.date);
        }
      });
      if (dates.length == 0) {
        return response.status(HttpStatus.OK).send({
          message: 'All days are certify by Driver',
          data: dates,
        });
      } else {
        return response.status(HttpStatus.OK).send({
          message: 'Dates with unCertify Records',
          data: dates,
        });
      }
    } else {
      return response.status(HttpStatus.OK).send({
        message: 'Driver has not been login to the app first time',
        data: [],
      });
    }
  }
  @updateCertification()
  async updateSpecficDaysCertification(
    @Query('dates') dates: [string],
    @Query('driverId') driverId: string,
    @Query('time') time: string,
    @Query('signature') signature: string,

    @Res() response: Response,
    @Req() request: Request,
  ) {
    let givenDates = [];
    if (!dates) {
      givenDates.push(dates);
    } else {
      givenDates = dates;
    }
    const { id, tenantId, companyTimeZone } =
      request.user ?? ({ tenantId: undefined } as any);
    let isMatched = await checkSign(
      signature,
      driverId,
      this.tripInspectionService,
      this.serviceSign,
      this.awsService,
      companyTimeZone,
    );
    if (isMatched) {
      let logsOfSelectedDate;
      if (givenDates.length != 0) {
        const currentDate = moment().format('YYYY-MM-DD').toString();
        for (let date of givenDates) {
          logsOfSelectedDate =
            await this.tripInspectionService.getLogsBetweenRange(
              driverId,
              date,
              date,
            );
          let certify = {};

          certify['eventSequenceIdNumber'] = '1C';
          certify['eventCode'] = '1';
          if (currentDate == date) {
            certify['eventDate'] = moment().format('MMDDYY').toString();
            const newtime = new Date();
            const options = {
              timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
            };
            const nowinstring = newtime.toLocaleString('en-US', options);
            const now = new Date(Date.parse(nowinstring));
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const hhmmss = hours + minutes + seconds;
            certify['eventTime'] = hhmmss;
          } else {
            certify['eventDate'] = moment(date).format('MMDDYY').toString();
            certify['eventTime'] = '235900';
          }
          if (time) {
            certify['eventTime'] = time;
          }
          certify['dateOfTheCertifiedRecord'] = certify['eventDate'];
          certify['correspondingCmvOrderNumber'] = '1';
          certify['malfunctionIndicatorStatusForEld'] = '0';
          certify['certificateType'] = '4';
          getEventsCheckSum(certify);
          logsOfSelectedDate.data[0].csv.eldEventListForDriverCertificationOfOwnRecords =
            [certify];
          // logsOfSelectedDate.data[0].meta.editRequest = true;
          let update = await this.tripInspectionService.updateCertification(
            driverId,
            logsOfSelectedDate,
          );
          console.log(update);
          const requestLog: LogFormRequest = new LogFormRequest();
          requestLog.from = '';
          requestLog.to = '';

          // requestLog.shippingDocument = '';

          const signs = await splitSign(signature);
          requestLog.sign = signs;

          let logResult = await this.serviceSign.UpdateLogForm(
            requestLog,
            driverId,
            date,
            true,
            companyTimeZone,
          );
        }

        /**
         * Notification handling
         */
        let messagePatternDriver;
        messagePatternDriver = await firstValueFrom<MessagePatternResponseType>(
          this.driverClient.send({ cmd: 'get_driver_by_id' }, driverId),
        );
        if (messagePatternDriver?.isError) {
          mapMessagePatternResponseToException(messagePatternDriver);
        }
        const user = messagePatternDriver?.data;

        const title = 'Certification added!';
        const notificationObj = {
          logs: [],
          dateTime: '',
          notificationType: 4,
          driverId: driverId,
          editStatusFromBO: 'save',
        };
        const deviceInfo = {
          deviceToken: user?.deviceToken,
          deviceType: user?.deviceType,
        };
        const isSilent = true;
        await dispatchNotification(
          title,
          notificationObj,
          deviceInfo,
          this.pushNotificationClient,
          isSilent,
        );
        // END notification handler

        return response.status(HttpStatus.OK).send({
          message: 'Certification is added Succefully  ',
          data: givenDates,
        });
      } else {
        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
          message: 'Please Select the dates for certification ',
          data: [],
        });
      }
    } else {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
        message: 'Please provide valid signature ',
        data: [],
      });
    }

    // let logsOfSelectedDate =
    // await this.tripInspectionService.getLogsBetweenRange(
    //   driverId,
    //   dates,

    // );
  }
  //  @UseInterceptors(new MessagePatternResponseInterceptor())
  @MessagePattern({ cmd: 'certification' })
  async update_certification(requestParam: any): Promise<any> {
    try {
      const { date, driverId, time, signature, companyTimeZone } = requestParam;
      let givenDates = [date];

      let isMatched = await checkSign(
        signature,
        driverId,
        this.tripInspectionService,
        this.serviceSign,
        this.awsService,
        companyTimeZone,
      );
      if (isMatched) {
        let logsOfSelectedDate;
        if (givenDates.length != 0) {
          const currentDate = moment().format('YYYY-MM-DD').toString();
          for (let date of givenDates) {
            logsOfSelectedDate =
              await this.tripInspectionService.getLogsBetweenRange(
                driverId,
                date,
                date,
              );
            let certificationArr =
              logsOfSelectedDate.data[0].csv
                .eldEventListForDriverCertificationOfOwnRecords;
            let certify = {};

            certify['eventSequenceIdNumber'] = generateUniqueHexId();
            certify['eventCode'] = '1';
            if (currentDate == date) {
              certify['eventDate'] = moment().format('MMDDYY').toString();
              const newtime = new Date();
              const options = {
                timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
              };
              const nowinstring = newtime.toLocaleString('en-US', options);
              const now = new Date(Date.parse(nowinstring));
              const hours = now.getHours().toString().padStart(2, '0');
              const minutes = now.getMinutes().toString().padStart(2, '0');
              const seconds = now.getSeconds().toString().padStart(2, '0');
              const hhmmss = hours + minutes + seconds;
              certify['eventTime'] = hhmmss;
            } else {
              certify['eventDate'] = moment(date).format('MMDDYY').toString();
              certify['eventTime'] = '235900';
            }
            if (time) {
              certify['eventTime'] = time;
            }
            certify['dateOfTheCertifiedRecord'] = certify['eventDate'];
            certify['correspondingCmvOrderNumber'] = '1';
            certify['malfunctionIndicatorStatusForEld'] = '0';
            certify['certificateType'] = '4';
            getEventsCheckSum(certify);
            certificationArr.push(certify);
            logsOfSelectedDate.data[0].csv.eldEventListForDriverCertificationOfOwnRecords =
              certificationArr;
            // logsOfSelectedDate.data[0].meta.editRequest = true;
            let update = await this.tripInspectionService.updateCertification(
              driverId,
              logsOfSelectedDate,
            );
            console.log(update);
            const requestLog: LogFormRequest = new LogFormRequest();
            requestLog.from = '';
            requestLog.to = '';

            // requestLog.shippingDocument = '';

            const signs = await splitSign(signature);
            requestLog.sign = signs;

            let logResult = await this.serviceSign.UpdateLogForm(
              requestLog,
              driverId,
              date,
              true,
              companyTimeZone,
            );
          }
          return { message: 'certification added', data: givenDates };
        } else {
          return {
            message: 'please select date for certification',
            data: givenDates,
          };
        }
      } else {
        return isMatched;
      }
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      return err;
    }
  }
  @UseInterceptors(new MessagePatternResponseInterceptor())
  @MessagePattern({ cmd: 'update_logform' })
  async updateLogForm(requestParam: any): Promise<any> {
    const requestLog: LogFormRequest = new LogFormRequest();
    const {
      from,
      to,
      ship,
      signature,
      driverId,
      date,
      companyTimeZone,
      trailerNumber,
    } = requestParam;
    requestLog.from = from;
    requestLog.to = to;
    requestLog.shippingDocument = ship;
    if (trailerNumber != '') {
      requestLog.trailerNumber = trailerNumber;
    }

    if (signature) {
      const signs = await splitSign(signature);
      requestLog.sign = signs;
    } else {
      // requestLog.sign = {}
    }
    let logResult = await this.serviceSign.UpdateLogForm(
      requestLog,
      driverId,
      date,
      true,
      companyTimeZone,
    );
    return { message: ' logform updated', data: logResult };
  }

  // @UseInterceptors(new MessagePatternResponseInterceptor())
  @MessagePattern({ cmd: 'edit_Report' })
  async editReport(requestParam: any): Promise<any> {
    try {
      const { tenantId, driverId, dateStart, csv } = requestParam;

      let unitData = await this.tripInspectionService.getUnitData(driverId);
      let companyTimeZone = unitData.homeTerminalTimeZone.tzCode;

      function previousWeekDate(dateStr) {
        // Create a new Date object from the input date string
        const date = new Date(dateStr);

        // Get the UTC values for year, month, and day
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');

        // Create a new Date object with UTC values
        const utcDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

        // Subtract 7 days from the UTC date to get the previous week's date
        utcDate.setUTCDate(utcDate.getUTCDate() - 7);

        // Get the year, month, and day of the new date object and format it as a string
        const newYear = utcDate.getUTCFullYear();
        const newMonth = (utcDate.getUTCMonth() + 1)
          .toString()
          .padStart(2, '0');
        const newDay = utcDate.getUTCDate().toString().padStart(2, '0');
        const newDateStr = `${newYear}-${newMonth}-${newDay}`;

        // Return the new date string
        return newDateStr;
      }
      let date = dateStart;
      let previousdate = previousWeekDate(date);
      Logger.log('previous date :  ' + previousdate);

      // let logsOfSelectedDate =
      //   await this.tripInspectionService.getLogsBetweenRange(
      //     driverId,
      //     previousdate,
      //     date,
      //   );
      let checkDate = date.split('-');
      let todayDate = date;
      let malfunctionIndicator = 'NO';
      let unidentifiedIndicator = 'NO';
      let dataDignosticIndicator = 'NO';

      if (csv.malfunctionsAndDiagnosticEventRecords.length != 0) {
        const malfunctionAndDiagnostic =
          csv.malfunctionsAndDiagnosticEventRecords;
        malfunctionAndDiagnostic.map((item, index) => {
          if (item.eventCode == '3' || item.eventCode == '4') {
            dataDignosticIndicator = 'YES';
          }
          if (item.eventCode == '1' || item.eventCode == '2') {
            malfunctionIndicator = 'YES';
          }
        });
      }
      if (csv.eventLogListForUnidentifiedDriverProfile.length != 0) {
        unidentifiedIndicator = 'YES';
      }

      // Logger.log(logsOfSelectedD2e4ate)
      // convert ICD logs to V1 logs.
      // let { resGraph, resRecap, resClock } =
      //   this.tripInspectionService.findGraph(
      //     driverId,
      //     date,
      //     tenantId,
      //     companyTimeZone,
      //   );
      function getDistance(dutyStatuses) {
        let distance = 0;
        dutyStatuses.map((element, index) => {
          distance += Number(element.accumulatedVehicleMiles);
        });
        return distance;
      }
      function getNext8Days(dateString) {
        Logger.log('Incoming date: -----------> ', dateString);
        const result = [];
        const currentDate = new Date(dateString);
        currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 in UTC

        const formattedStartDate = `${currentDate.getFullYear().toString()}-${(
          currentDate.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${currentDate
          .getUTCDate()
          .toString()
          .padStart(2, '0')}`;

        result.push(formattedStartDate);

        Logger.log('Formatted Start Date: ' + formattedStartDate);

        for (let i = 0; i < 6; i++) {
          const nextDate = new Date(currentDate);
          nextDate.setUTCDate(currentDate.getUTCDate() + (i + 1)); // Increment i by 1 to get the correct next date
          Logger.log('Next Date: ------ > ', nextDate);

          const formattedDate = `${nextDate.getFullYear().toString()}-${(
            nextDate.getUTCMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${nextDate
            .getUTCDate()
            .toString()
            .padStart(2, '0')}`;
          result.push(formattedDate);
        }

        return result;
      }

      function convertHM(value) {
        // Hours, minutes and seconds
        let ret = '';
        if (value) {
          var hrs = value / 3600;
          var mins = (value % 3600) / 60;
          // Output like "1:01" or "4:03:59" or "123:03:59"
          if (hrs > 0) {
            ret +=
              '' +
              (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) +
              ':';
          } else {
            ret += '00:';
          }
          if (mins > 0) {
            ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
          } else {
            ret += '00';
          }
        } else {
          ret = '00:00';
        }

        return ret;
      }
      let allDaysworkHour = getNext8Days(previousdate);
      Logger.log(
        'Start Date ===================================> End date  ============= >' +
          allDaysworkHour,
      );

      let object = [
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
        '00:00',
      ];
      object.reverse();
      let totalDutyTime = 0;
      let totalMielsTrevled = getDistance(
        csv.eldEventListForDriversRecordOfDutyStatus,
      );
      // logsOfSelectedDate.data.map(async (item, index) => {
      //   // if(item.csv.eldEventListForDriversRecordOfDutyStatus.length !=0)
      //   let newData = convertICDtoV1(
      //     logsOfSelectedDate.data[index].csv,
      //     driverId,
      //     tenantId,
      //     companyTimeZone,
      //   );
      //   let updatedDataGraph = await graphUpdatedData(newData);
      //   if (newData[newData.length - 1].status == 'ON SB') {
      //     updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
      //       updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
      //       (newData[newData.length - 1].lastStartedAt -
      //         newData[newData.length - 1].startedAt);
      //   } else if (newData[newData.length - 1].status == 'OFF DUTY'|| newData[newData.length - 1].status == 'PC') {
      //     updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
      //       updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
      //       (newData[newData.length - 1].lastStartedAt -
      //         newData[newData.length - 1].startedAt);
      //   } else if (newData[newData.length - 1].status == 'ON DUTY' || newData[newData.length - 1].status == 'YM') {
      //     // console.log("before time " +updatedDataGraph.TotalTimeInHHMM.totalDutyTime )
      //     updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
      //       updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
      //       (newData[newData.length - 1].lastStartedAt -
      //         newData[newData.length - 1].startedAt);
      //     // console.log("differance : " +(newData[newData.length-1].lastStartedAt - newData[newData.length-1].startedAt) );
      //   } else if (newData[newData.length - 1].status == 'ON DRIVING') {
      //     updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
      //       updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
      //       (newData[newData.length - 1].lastStartedAt -
      //         newData[newData.length - 1].startedAt);
      //   }
      //   if (allDaysworkHour.includes(item.date)) {
      //     let totalDutyHours =
      //       updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
      //       updatedDataGraph.TotalTimeInHHMM.totalDrivingTime;
      //     let dateIndex = allDaysworkHour.indexOf(item.date);
      //     totalDutyTime += totalDutyHours;
      //     let eachObject = '';
      //     eachObject = convertHM(totalDutyHours);

      //     object[dateIndex] = eachObject;

      //     // let a = eachObject
      //     // console.log('df');
      //   }
      // });
      let list: InspectionResponse[] = [];
      let inspection = await this.tripInspectionService.findInspection(
        driverId,
        date,
      );

      if (inspection && inspection.length > 0) {
        for (const item of inspection) {
          list.push(new InspectionResponse(item));
        }
      }

      let newGraph = convertICDtoV1(csv, driverId, tenantId, companyTimeZone);

      // let clock= logsOfSelectedDateconsole.log()
      let updatedDataGraph = await graphUpdatedData(newGraph);
      if (newGraph[newGraph.length - 1].status == 'ON SB') {
        updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime =
          updatedDataGraph.TotalTimeInHHMM.totalSleeperBerthTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'OFF DUTY' ||
        newGraph[newGraph.length - 1].status == 'PC'
      ) {
        updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalOffDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      } else if (
        newGraph[newGraph.length - 1].status == 'ON DUTY' ||
        newGraph[newGraph.length - 1].status == 'YM'
      ) {
        console.log(
          'before time ' + updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
        );
        updatedDataGraph.TotalTimeInHHMM.totalDutyTime =
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
        console.log(
          'differance : ' +
            (newGraph[newGraph.length - 1].lastStartedAt -
              newGraph[newGraph.length - 1].startedAt),
        );
      } else if (newGraph[newGraph.length - 1].status == 'ON DRIVING') {
        updatedDataGraph.TotalTimeInHHMM.totalDrivingTime =
          updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
          (newGraph[newGraph.length - 1].lastStartedAt -
            newGraph[newGraph.length - 1].startedAt);
      }

      // let recap = await resRecap;

      // let recaps = Object.keys(recap);
      // let clockData = await resClock;
      // recaps.forEach((item) => {
      //   recap[item]['total'] = 0;
      //   if (recap[item].hasOwnProperty('hoursWorked')) {
      //     recap[item]['total'] +=
      //       recap[item]['hoursWorked'].totalSecondsSpentSoFar;
      //   }
      // });

      let newRecap = {
        date: date,
        recapData: {
          hoursWorked: {
            totalSecondsSpentSoFar:
              updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
              updatedDataGraph.TotalTimeInHHMM.totalDutyTime,
          },
          offDuty: {
            totalSecondsSpentSoFar: 1,
          },
          total:
            updatedDataGraph.TotalTimeInHHMM.totalDutyTime +
            updatedDataGraph.TotalTimeInHHMM.totalDrivingTime,
        },
      };
      totalDutyTime =
        252000 -
        (updatedDataGraph.TotalTimeInHHMM.totalDrivingTime +
          updatedDataGraph.TotalTimeInHHMM.totalDutyTime);
      if (totalDutyTime < 0) {
        totalDutyTime = 0;
      }
      // let usdot = logsOfSelectedDate.data[0].cdv.carrierLine.carriersUSDOTNumber;
      // console.log("hdshdjsa"+logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData.driveSeconds);

      unitData.coDriverId =
        csv.coDriver.coDriverFirstName + ' ' + csv.coDriver.coDriverLastName;
      let buffer = await generateEditPdf(
        newGraph, //according to v2
        // updatedDataGraph?.updatedGraph, // according to v1
        // recap, // according to v1
        newRecap, // according to v2
        list,
        unitData,
        updatedDataGraph?.TotalTimeInHHMM, // according to v2
        date,
        this.serviceSign,
        driverId,
        companyTimeZone,
        this.awsService,
        // logsOfSelectedDate.data[logsOfSelectedDate.data.length-1].meta.clockData,
        object,
        totalDutyTime,
        unidentifiedIndicator,
        dataDignosticIndicator,
        malfunctionIndicator,
        totalMielsTrevled,
        // usdot,// according to v2
      );
      var string = Buffer.from(buffer).toString('base64'); //buffer.toString('base64');
      return {
        isMessagePattern: true,
        isError: false,
        message: 'Image conversion success!',
        data: string,
      };
    } catch (err) {
      Logger.log(err);
      throw err;
    }
  }
  // @UseInterceptors(new MessagePatternResponseInterceptor())
  @MessagePattern({ cmd: 'get_logform' })
  async getLogForm(dataRecive): Promise<any> {
    let logResult = await getLogsFormData(
      dataRecive.date,
      dataRecive.driverId,
      this.tripInspectionService,
      this.serviceSign,
      this.awsService,
      dataRecive.tenantId,
      dataRecive.companyTimeZone,
    );
    return { message: ' logform updated', data: logResult };
  }
}
