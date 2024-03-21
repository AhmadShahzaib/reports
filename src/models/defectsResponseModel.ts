import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';
import { BaseResponseType } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { DefectsCategory } from 'enums';
import DefectsDocument from 'mongoDb/documents/defectsDocument';

export class DefectResponse extends BaseResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  defectName: string;

  @ApiProperty()
  category: DefectsCategory;

  @ApiProperty()
  tenantId?: Schema.Types.ObjectId;

  @ApiProperty()
  isActive: boolean;

  constructor(defectDocument: any) {
    super();
    this.id = defectDocument?.id;
    this.defectName = defectDocument?.defectName;
    this.category = defectDocument?.category;
    this.isActive = defectDocument?.isActive;
  }
}
