import mongoose, { Model, FilterQuery } from 'mongoose';

import { HttpStatus, Inject, Injectable, Logger, Scope } from '@nestjs/common';

import {
  BaseService,
  ConfigurationService,
  MessagePatternResponseType,
  mapMessagePatternResponseToException,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import TIDocument from 'mongoDb/documents/TIDocument';
import { InspectionRequest } from 'models/inspectionRequestModel';
import { ClientProxy } from '@nestjs/microservices';
import { async, firstValueFrom } from 'rxjs';
import moment from 'moment';
import EldSubmitionRecordDocument from 'mongoDb/documents/eldSubmitionRecord';
import IftaReportSubmissionRecordsDocument from 'mongoDb/documents/iftaReportSubmission';
import { getEventsCheckSum } from 'utils/eventFuntion';
import { LogFormRequest } from 'models/logForm';
import { response } from 'express';
import { dispatchNotification } from 'utils/dispatchNotification';
import { splitSign } from 'utils/splitSign';
import { SignService } from './signService';
import { generateUniqueHexId } from 'utils/randomSEQ';

@Injectable({ scope: Scope.REQUEST })
export class AppService extends BaseService<TIDocument> {
  private readonly logger = new Logger('HOSStatusService');

  constructor(
    @InjectModel('inspections') private tripInspectionModel: Model<TIDocument>,
    @InjectModel('defects') private defectsModel: Model<TIDocument>,
    @InjectModel('eldSubmitionRecord')
    private eldSubmitionRecord: Model<EldSubmitionRecordDocument>,
    @InjectModel('iftaSubmissionRecord')
    private iftaSubmissionRecord: Model<IftaReportSubmissionRecordsDocument>,

    @Inject('HOS_SERVICE') private readonly client: ClientProxy,
    @Inject('UNIT_SERVICE') private readonly unitClient: ClientProxy,
    @Inject('SignService') private readonly serviceSign: SignService,
    private readonly configService: ConfigurationService,
  ) {
    super();
  }
  addInspection = async (inspection): Promise<TIDocument> => {
    try {
      Logger.debug(inspection);
      let query = await this.tripInspectionModel.create(inspection);
      // return await query.populate({
      //   path: 'defectsCategory',
      //   populate: {
      //     path: 'vehicle.defects trailer.defects',
      //     model: 'defects',
      //   },
      // });
      return query;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getDefectsList = async () => {
    try {
      // query based on category
      const query = (category) => {
        return this.defectsModel
          .find({
            category: category,
            isActive: true,
            isDeleted: false,
          })
          .select('_id category defectName');
      };

      // Fetch results
      const defectsList = await Promise.all([
        await query('vehicle'),
        await query('trailer'),
      ]);

      return {
        vehicle: defectsList[0].length > 0 ? defectsList[0] : [],
        trailer: defectsList[1].length > 0 ? defectsList[1] : [],
      };
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error in getting defects list',
        error: error.message,
      });
    }
  };

  deleteInspection = async (inspectionId) => {
    try {
      // Fetch results
      const deletedInspection = await this.tripInspectionModel.deleteOne({
        _id: inspectionId,
      });

      return {
        message:
          deletedInspection.deletedCount > 0
            ? 'Inspection deleted successfully!'
            : 'Inspection record not found',
        data: {},
      };
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Error in getting defects list',
        error: error.message,
      });
    }
  };

  deleteOne = async (id: string) => {
    try {
      return await this.tripInspectionModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { upsert: true },
      );
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  updateInspection = async (id: string, inspection) => {
    try {
      //  Get inspection record
      const inspectionRecord: any = await this.tripInspectionModel.findOne({
        _id: id,
      });

      // Update values in inspection record
      inspectionRecord.status = inspection.status;
      if (inspection.status == 'No Defects') {
        inspectionRecord.defectsCategory.vehicle = [];
        inspectionRecord.defectsCategory.trailer = [];
      }

      inspectionRecord.signatures[`mechanicSignature`] =
        inspection.signatures.mechanicSignature;
        inspectionRecord.signatures[`driverSignature`] =
        inspection.signatures.driverSignature;

      //  save updated record
      await inspectionRecord.save();

      return inspectionRecord;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  find = (options) => {
    try {
      const query = this.tripInspectionModel.find(options);
      query.and([{ isDeleted: false, isActive: true }]);
      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findAllDvir = (options, queryParams) => {
    try {
      const { pageNo, limit } = queryParams;

      const query = this.tripInspectionModel.find(options);
      query.and([{ isDeleted: false, isActive: true }]);
      // if (orderBy && sortableAttributes.includes(orderBy)) {
      //   query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      // } else {
      //   query.sort({ createdAt: -1 });
      // }
      if (!limit || !isNaN(limit)) {
        query.skip(((pageNo ?? 1) - 1) * (limit ?? 10)).limit(limit ?? 10);
      }

      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getGraphDataOnRange = async (
    driverId: string,
    startOfRange: number,
    endOfRange: number,
    groupRecords: Boolean,
    includeAllLogs: Boolean,
  ) => {
    try {
      const GraphDataOnRange = await firstValueFrom(
        this.client.send(
          { cmd: 'getRecordLog' },
          { driverId, startOfRange, endOfRange, groupRecords, includeAllLogs },
        ),
      );
      return GraphDataOnRange;
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  };
  notifyDriver = async (SpecificClient, user, date, notificationObj) => {
    const GraphDataOnRange = await firstValueFrom(
      this.client.send(
        { cmd: 'call_sync' },
        { SpecificClient, user, date, notificationObj },
      ),
    );
    return GraphDataOnRange;
  };
  findGraph = (
    driverId: string,
    date: string,
    tenantId: string,
    companyTimeZone: string,
  ) => {
    try {
      const resGraph = firstValueFrom(
        this.client.send(
          { cmd: 'get_driver_graph_data' },
          { driverId, date, tenantId },
        ),
      );
      const resRecap = firstValueFrom(
        this.client.send(
          { cmd: 'get_driver_recap_data' },
          { driverId, date, companyTimeZone },
        ),
      );
      const resClock = firstValueFrom(
        this.client.send(
          { cmd: 'get_driver_clock_data' },
          { driverId, tenantId },
        ),
      );
      return { resGraph, resRecap, resClock };
      // return ;
      // if (res.isError) {
      //   Logger.log('Error in getting  Graph data from HOS Service');
      //   mapMessagePatternResponseToException(res);
      // }
      // return res.data;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  findRecap = async (driverId: string, date: string) => {
    try {
      const res = firstValueFrom(
        this.client.send({ cmd: 'get_driver_recap_data' }, { driverId, date }),
      );
      return res;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findOne = async (inspectionId) => {
    try {
      return await this.tripInspectionModel
        .find({
          _id: inspectionId,
        })
        .limit(1)
        // .sort({ $natural: -1 })
        .and([{ isDeleted: false }]);
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getAll = (options) => {
    try {
      const query = this.eldSubmitionRecord.find(options);
      query.and([{ isDeleted: false }]);
      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  addReportSubmitTable = (submitionDeatils: {
    origin: string;
    eRODScode: string;
    driver: string;
    dateStart: string;
    dateEnd: string;
    status: string;
    createdTime: string;
    submissionID: string;
    errors: Array<any>;
    warnings: Array<any>;
    tenantId: string;
  }) => {
    try {
      const query = this.eldSubmitionRecord.create(submitionDeatils);
      return true;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  // IFTA FUNCTIONS
  addIFTA = (submitionDeatils: {
    reportType: string;
    Name: string;
    recipient: string;
    createdAt: string;
    pdf: string;
    csv: string;
    tenantId: string;
  }) => {
    try {
      const query = this.iftaSubmissionRecord.create(submitionDeatils);
      return true;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getAllIFTA = (options) => {
    try {
      const query = this.iftaSubmissionRecord.find(options);
      query.and([{ isDeleted: false }]);
      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  countItemsIFTA = async (options) => {
    try {
      return await this.iftaSubmissionRecord
        .count(options)
        .and([{ isDeleted: false }]);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  deleteOneIFTA = async (id: string) => {
    try {
      return await this.iftaSubmissionRecord.deleteOne({ _id: id });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  countItems = async (options) => {
    try {
      return await this.eldSubmitionRecord
        .count(options)
        .and([{ isDeleted: false }]);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  getUnitData = async (driverId: string) => {
    try {
      const res = await firstValueFrom(
        this.unitClient.send(
          { cmd: 'get_assigned_driver_eld_SerialNo' },
          driverId,
        ),
      )
        .then((success) => {
          return success;
        })
        .catch((error) => {
          Logger.log('Error in getting  Graph data from UNIT srvice');
          mapMessagePatternResponseToException(res);
        });
      // if (res.isError) {
      //   Logger.log('Error in getting  Graph data from UNIT srvice');
      //   mapMessagePatternResponseToException(res);
      // }
      return res.data;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  getLogsBetweenRange = async (driverId: any, startDate: any, endDate: any) => {
    try {
      const res = await firstValueFrom(
        this.client.send(
          { cmd: 'get_logs_of_specific_date_range' },
          { driverId, startDate, endDate },
        ),
      );
      return res;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  updateCertification = async (driverId: any, csv: any) => {
    try {
      const res = await firstValueFrom(
        this.client.send({ cmd: 'update_certification' }, { driverId, csv }),
      );
      return res;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  updateSgin = async (driverId: string, imageUrl: string) => {
    try {
      const res = await firstValueFrom(
        this.unitClient.send(
          { cmd: 'updagte_image_URL' },
          { driverId, imageUrl },
        ),
      );
      if (res.isError) {
        Logger.log('error in updateing');
        mapMessagePatternResponseToException(res);
      }
      return res.data;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getCSV = async (collectionName: any) => {
    try {
      const res = await firstValueFrom(
        this.client.send({ cmd: 'get_length_of_data' }, { collectionName }),
      );
      return res;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  updateUnitDriverSign = async (
    driverId: string,
    imageKey: string,
    imageName: string,
  ) => {
    try {
      const res = await firstValueFrom(
        this.unitClient.send(
          { cmd: 'update_signature_image' },
          { driverId: driverId, imageKey: imageKey, imageName: imageName },
        ),
      );
      if (res.isError) {
        mapMessagePatternResponseToException(res);
      }
      return res.data;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findInspection = async (id: string, date: string): Promise<TIDocument[]> => {
    try {
      const requestedDateStart = moment(date, 'YYYY-MM-DD')
        .startOf('day')
        .unix();
      const requestedDateEnd = moment(date || moment(), 'YYYY-MM-DD')
        .endOf('day')
        .unix();

      return await this.tripInspectionModel
        .find({
          $and: [
            { driverId: id },
            { isDeleted: { $ne: null } },
            { isDeleted: false },
            {
              inspectionTime: {
                $gte: requestedDateStart,
                $lte: requestedDateEnd,
              },
            },
          ],
        })
        .populate({
          path: 'defectsCategory',
          populate: {
            path: 'vehicle.defects trailer.defects',
            model: 'defects',
          },
        });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  certification = async (
    driverId: string,
    givenDates,
    companyTimeZone: string,
    time,
    signature,
  ) => {
    try {
      let logsOfSelectedDate;
      if (givenDates.length != 0) {
        const currentDate = moment().format('YYYY-MM-DD').toString();
        for (let date of givenDates) {
          logsOfSelectedDate = JSON.parse(
            JSON.stringify(
              await this.getLogsBetweenRange(driverId, date, date),
            ),
          );
          let certificationArr = logsOfSelectedDate.data
            ? logsOfSelectedDate.data[0]?.csv
                .eldEventListForDriverCertificationOfOwnRecords
            : [];
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
          console.log(`certificationArr >>>> `, typeof certificationArr);
          certificationArr.push(certify);

          if (logsOfSelectedDate.data) {
            logsOfSelectedDate.data[0].csv.eldEventListForDriverCertificationOfOwnRecords =
              certificationArr;
            logsOfSelectedDate.data[0].meta.editRequest = true;
          }

          let update = await this.updateCertification(
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

        return true;
      }
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
}
