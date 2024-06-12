import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InspectionResponse } from 'models/inspectionresponseModel';

export const getInspectionData = async (
  inspections: any,
  awsService: AwsService,
) => {
  try {
    const data = new InspectionResponse(inspections);
    if (data?.defectsCategory?.vehicle?.length > 0) {
      for (const item of data.defectsCategory?.vehicle) {
        const vehicleDefectPath = await awsService.getObject(item?.key);
        item['imagePath'] = `data:image/${item.imageName
          .split('.')
          .pop()};base64,${vehicleDefectPath.replace(/\s+/g, '')}`;
      }
    }
    if (data?.defectsCategory?.trailer?.length > 0) {
      for (const item of data.defectsCategory?.trailer) {
        const trailerDefectPath = await awsService.getObject(item?.key);
        item['imagePath'] = `data:image/${item.imageName
          .split('.')
          .pop()};base64,${trailerDefectPath.replace(/\s+/g, '')}`;
      }
    }
    const driverSign = data?.signatures?.driverSignature;
    const mechanicSign = data?.signatures?.mechanicSignature;
    if (driverSign?.key) {
      const driverSignature = await awsService.getObject(
        data?.signatures?.driverSignature?.key,
      );
      driverSign['imagePath'] = `data:image/${driverSign.imageName
        .split('.')
        .pop()};base64,${driverSignature.replace(/\s+/g, '')}`;
    }
    if (mechanicSign?.key) {
      const mechanicSignature = await awsService.getObject(mechanicSign?.key);
      mechanicSign['imagePath'] = `data:image/${mechanicSign.imageName
        .split('.')
        .pop()};base64,${mechanicSignature.replace(/\s+/g, '')}`;
    }
    return inspections;
  } catch (err) {
    throw err;
  }
};
