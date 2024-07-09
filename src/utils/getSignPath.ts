import { Logger } from '@nestjs/common';
import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';

export const getDriverSign = async (
  data: any,
  logForm: any,
  awsService: AwsService,
) => {
  try {
    if (data && Object.keys(data['_doc']).length > 0) {
      if (logForm?.sign && Object.keys(logForm?.sign['_doc']).length > 0) {
        const sign = logForm?.sign['_doc'];
        let path;
        try {
          path = await awsService.getObject(sign?.key);
        } catch (error) {
          Logger.log(error);
          return logForm;
        }
        sign['imageUrl'] = sign?.imageUrl;
        sign['imagePath'] = `data:image/${sign?.imageName
          .split('.')
          .pop()};base64,${path.replace(/\s+/g, '')}`;
        delete sign['key'];
        delete sign['imageUrl'];
        logForm.sign = sign;
      }
    }
    return logForm;
  } catch (err) {
    throw err;
  }
};
