import mongoose, { Model } from 'mongoose';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import {
  ConfigurationService,
  getTimeZoneDateRangeForDay,
  mapMessagePatternResponseToException,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import { LogFormRequest } from 'models/logForm';
import DriverSignDocument from 'mongoDb/documents/driverSign';
import moment from 'moment-timezone';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Injectable({ scope: Scope.REQUEST })
export class SignService {
  private readonly logger = new Logger('DefectsService');
  constructor(
    @InjectModel('driverSign') private signModel: Model<DriverSignDocument>,
    @Inject('UNIT_SERVICE') private readonly unitClient: ClientProxy,
    private readonly configService: ConfigurationService,
  ) {}
  UpdateLogForm = async (
    logForm: LogFormRequest,
    driverId: string,
    date: string,
    upsert: true,
    companyTimeZone: string,
  ): Promise<any> => {
    try {
      Logger.debug(logForm);
      const currentDate = moment(date).unix();
      // const { start: startOfDay, end: endOfDay } = getTimeZoneDateRangeForDay(
      //   moment(date).format('YYYY-MM-DD'),
      //   companyTimeZone,
      // );
      const start = moment(date, 'YYYY-MM-DD').startOf('day').unix();
      const end = moment(date, 'YYYY-MM-DD').endOf('day').unix();
      // let homeTerminalAddress = logForm.homeTerminalAddress;
      logForm['date'] = currentDate;
      const data = await this.signModel.findOneAndUpdate(
        { driverId: driverId, date: { $gte: start, $lte: end } },
        { $set: logForm },
        {
          new: true,
          upsert,
          rawResult: true,
        },
      );
      // if (
      //   data &&
      //   Object.  keys(data).length > 0 &&
      //   logForm?.homeTerminalAddressId
      // ) {
      //   let homeTerminalAddressId = logForm.homeTerminalAddressId;
      //   const resUnit = await firstValueFrom(
      //     this.unitClient.send(
      //       { cmd: 'update_terminal' },
      //       { driverId, homeTerminalAddressId, homeTerminalAddress },
      //     ),
      //   );
      // }
      return data;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  getLogFormNotes = async (
    driverId: string,
    date: string,
    companyTimeZone: string,
  ): Promise<any> => {
    try {
      // let dateRR = date.split(",");
      let start = moment(date, 'YYYY-MM-DD').startOf('day').unix();
      let end = moment(date, 'YYYY-MM-DD').endOf('day').unix();
      const logform = await this.signModel
        .findOne({
          driverId: driverId,
          date: { $gte: start, $lte: end },
        })
        .lean();
      if (!logform) {
        return false;
      }

      return logform.notes;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  updateNotes = async (
    notes: string,
    driverId: string,
    date: string,
    companyTimeZone: string,
  ): Promise<any> => {
    try {
      // let dateRR = date.split(",");
      let start = moment(date, 'YYYY-MM-DD').startOf('day').unix();
      let end = moment(date, 'YYYY-MM-DD').endOf('day').unix();
      const data = await this.signModel.findOneAndUpdate(
        {
          driverId: driverId,
          date: { $gte: start, $lte: end },
        },
        {
          $set: { notes: notes },
        },
        {
          new: true,
          upsert: true,
          rawResult: true,
        },
      );

      if (!data.value) {
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findLogForm = async (
    driverId: string,
    date: string,
    companyTimeZone: string,
  ): Promise<any> => {
    try {
      // let dateRR = date.split(",");
      const start = moment(date, 'YYYY-MM-DD').startOf('day').unix();
      const end = moment(date, 'YYYY-MM-DD').endOf('day').unix();
      return await this.signModel.findOne({
        driverId: driverId,
        date: { $gte: start, $lte: end },
      });
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findLogFormMostRecent = async (
    driverId: string,
    date: string,
    companyTimeZone: string,
  ): Promise<any> => {
    try {
      const start = moment(date, 'YYYY-MM-DD').startOf('day').unix();
      const end = moment(date, 'YYYY-MM-DD').endOf('day').unix();
      const mostRecentDocument = await this.signModel
        .findOne({
          driverId: driverId,
          date: { $lte: end }, // Find documents with date less than or equal to 'end'
        })
        .sort({ date: -1 }) // Sort in descending order of date
        .limit(1);
      return mostRecentDocument;
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
}
