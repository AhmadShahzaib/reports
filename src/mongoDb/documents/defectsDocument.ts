import { DefectsCategory } from 'enums';
export default interface DefectsDocument extends Document {
  category?: DefectsCategory;
  defectName?: string;
  isDeleted?: boolean;
  isActive: boolean;
  tenantId?: string;
}
