import { LogFormRequest } from 'models/logForm';
import moment from 'moment';
import { SignService } from 'services/signService';
export const signUpload = async (
  files,
  awsService: any,
  logRequest: LogFormRequest,
  tenantId: string,
  id: string,
) => {
  if (files && Object.keys(files).length > 0) {
    logRequest['sign'] = {};
    const image = await awsService.uploadFile(
      files?.buffer,
      `${tenantId}/${id}/Signatures/${moment().unix()}-${files?.originalname}`,
    );
    logRequest.sign['imageUrl'] = image.Location;
    logRequest.sign['key'] = image.key;
    logRequest.sign['imageName'] = files?.originalname;
  }
  return logRequest;
};
