import {
  BaseController,
  ListingParams,
  ListingParamsValidationPipe,
  MongoIdValidationPipe,
  SocketManagerService,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import moment from 'moment';
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
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DefectsService } from '../services/defects.service';
import AddDefectsDecorators from 'decorators/addDefects';
import { DefectsRequest } from 'models/defectsRequestModel';
import DefectsDocument from 'mongoDb/documents/defectsDocument';
import { FilterQuery } from 'mongoose';
import { DefectResponse } from 'models/defectsResponseModel';
import { Response, Request } from 'express';
import GetDefectsDecorators from 'decorators/getDefects';
import { searchableAttributes, sortableAttributes } from 'decorators';
import { JwtPayload } from 'jsonwebtoken';
@Controller('defects')
@ApiTags('defects')
export class DefectsController extends BaseController {
  private readonly logger = new Logger('TI App Controller');

  constructor(
    private readonly socketManager: SocketManagerService,
    @Inject('DefectsService') private readonly defectsService: DefectsService,
  ) {
    super();
  }

  @AddDefectsDecorators()
  async addDefects(
    @Body() defectRequest: DefectsRequest,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      const options: FilterQuery<DefectsDocument> = {
        $and: [{ isDeleted: false }],
        $or: [
          {
            defectName: {
              $regex: new RegExp(`^${defectRequest.defectName}`, 'i'),
            },
          },
        ],
      };
      defectRequest.tenantId = tenantId;
      const defetct = await this.defectsService.findOne(options);
      if (
        defetct &&
        defetct.defectName.toLowerCase() ===
          defectRequest.defectName.toLowerCase()
      ) {
        Logger.log(
          `Defetc already exist with name :${defectRequest.defectName}`,
        );
        throw new ConflictException(`Defect name already exists`);
      }
      const addDefect = await this.defectsService.addDefect(defectRequest);
      if (addDefect && Object.keys(addDefect).length > 0) {
        Logger.log(`Defect has been added successfully`);
        const result: DefectResponse = new DefectResponse(addDefect);
        return response.status(HttpStatus.OK).send({
          message: 'Defect has been added successfully',
          data: result,
        });
      } else {
        Logger.log(`Defect not create`);
        throw new InternalServerErrorException(
          `unknown error while creating Defect`,
        );
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // defects get API
  @GetDefectsDecorators()
  async getDefectsList(@Res() response: Response, @Req() request: Request) {
    try {
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      const options = {};
      const defectList: DefectResponse[] = [];
      const query = this.defectsService.find(options);
      let queryResponse;
      queryResponse = await query.exec();
      if (queryResponse && Object.keys(queryResponse).length > 0) {
        for (const defect of queryResponse) {
          defectList.push(new DefectResponse(defect));
        }
      }
      return response.status(HttpStatus.OK).send({
        message: 'Defects list found',
        data: defectList,
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }
}
