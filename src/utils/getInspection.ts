import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InspectionResponse } from 'models/inspectionresponseModel';

export let getInspectionData = async (
  inspections: any,
  awsService: AwsService,
) => {
  try {
    let data = new InspectionResponse(inspections);
    if (data?.defectsCategory?.vehicle?.length > 0) {
      for (let item of data.defectsCategory?.vehicle) {
        let vehicleDefectPath = await awsService.getObject(item?.key);
        item['imagePath'] = `data:image/${item.imageName
          .split('.')
          .pop()};base64,${vehicleDefectPath.replace(/\s+/g, '')}`;
      }
    }
    if (data?.defectsCategory?.trailer?.length > 0) {
      for (let item of data.defectsCategory?.trailer) {
        let trailerDefectPath = await awsService.getObject(item?.key);
        item['imagePath'] = `data:image/${item.imageName
          .split('.')
          .pop()};base64,${trailerDefectPath.replace(/\s+/g, '')}`;
      }
    }
    let driverSign = data?.signatures?.driverSignature;
    let mechanicSign = data?.signatures?.mechanicSignature;
    if (driverSign?.key) {
      let driverSignature = await awsService.getObject(
        data?.signatures?.driverSignature?.key,
      );
      driverSign['imagePath'] = `data:image/${driverSign.imageName
        .split('.')
        .pop()};base64,${driverSignature.replace(/\s+/g, '')}`;
    }
    if (mechanicSign?.key) {
      let mechanicSignature = await awsService.getObject(mechanicSign?.key);
      mechanicSign['imagePath'] = `data:image/${mechanicSign.imageName
        .split('.')
        .pop()};base64,${mechanicSignature.replace(/\s+/g, '')}`;
    }
    return inspections;
  } catch (err) {
    throw err;
  }
};
