import mongoose, { Model } from 'mongoose';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';

import { ConfigurationService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import DefectsDocument from 'mongoDb/documents/defectsDocument';
import { DefectsRequest } from 'models/defectsRequestModel';

@Injectable({ scope: Scope.REQUEST })
export class DefectsService {
  private readonly logger = new Logger('DefectsService');
  constructor(
    @InjectModel('defects') private defectModel: Model<DefectsDocument>,

    private readonly configService: ConfigurationService,
  ) {}
  addDefect = async (defect: DefectsRequest): Promise<DefectsDocument> => {
    try {
      Logger.debug(defect);
      return await this.defectModel.create(defect);
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  count = (options) => {
    try {
      return this.defectModel
        .count(options)
        .and([{ isDeleted: false, isActive: true }])
        .exec();
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  find = (options) => {
    try {
      const query = this.defectModel.find(options);
      query.and([{ isDeleted: false, isActive: true }]);
      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  findOne = async (option): Promise<DefectsDocument> => {
    try {
      return await this.defectModel.findOne(option);
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
}
