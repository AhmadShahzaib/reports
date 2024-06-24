import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InspectionRequest } from 'models/inspectionRequestModel';
import moment from 'moment';
import { AppService } from 'services/app.service';

export const imagesUpload = async (
  files,
  awsService: any,
  // defectRequest: InspectionRequest,
  defectRequest: InspectionRequest,
  tenantId: string,
  id: string,
  tripInspectionService: AppService,
) => {
  // if (
  //   files.defectImages &&
  //   Object.keys(files.defectImages).length > 0 &&
  //   defectRequest?.defectsCategory?.vehicle.length > 0
  // ) {
  //   let item;
  //   for (item of defectRequest?.defectsCategory?.vehicle) {
  //     let vehiclefiles = files.defectImages.find(
  //       (file) => item.imageName == file.originalname,
  //     );
  //     if (vehiclefiles) {
  //       let resUrl = await awsService.uploadFile(
  //         vehiclefiles.buffer,
  //         `${tenantId}/${id}/Defects/${moment().unix()}-${
  //           vehiclefiles?.originalname
  //         }`,
  //       );
  //       item.imageUrl = resUrl.Location;
  //       item.key = resUrl.key;
  //     }
  //   }
  // }
  // if (
  //   files.defectImages &&
  //   Object.keys(files.defectImages).length > 0 &&
  //   defectRequest?.defectsCategory?.trailer.length > 0
  // ) {
  //   let value;
  //   for (value of defectRequest?.defectsCategory?.trailer) {
  //     let defectsfiles = files.defectImages.find(
  //       (file) => value.imageName == file.originalname,
  //     );
  //     if (defectsfiles) {
  //       let imageUrl = await awsService.uploadFile(
  //         defectsfiles?.buffer,
  //         `${tenantId}/${id}/Defects/${moment().unix()}-${
  //           defectsfiles?.originalname
  //         }`,
  //       );
  //       value.imageUrl = imageUrl.Location;
  //       value.key = imageUrl.key;
  //     }
  //   }
  // }
  try {
    // Signature images upload
    if (
      files.signatureImages &&
      Object.keys(files.signatureImages).length > 0 &&
      (defectRequest?.signatures?.driverSignature ||
        defectRequest?.signatures?.mechanicSignature)
    ) {
      // Upload driver signature .
      const driverSignatureFiles = files.signatureImages.find(
        (file) =>
          defectRequest?.signatures?.driverSignature?.imageName ===
          file.originalname,
      );
      if (driverSignatureFiles) {
        try {
          const imageUrl = await awsService.uploadFile(
            driverSignatureFiles.buffer,
            `${tenantId}/${id}/Signatures/${Date.now()}-${
              driverSignatureFiles.originalname
            }`,
          );
          // await tripInspectionService.updateUnitDriverSign(
          //   id,
          //   imageUrl.key,
          //   driverSignatureFiles.originalname,
          // );
          defectRequest.signatures.driverSignature.imageUrl = imageUrl.Location;
          defectRequest.signatures.driverSignature.key = imageUrl.key;
        } catch (error) {
          Logger.error('Error uploading driver signature image', error);
          throw new InternalServerErrorException(
            'Error uploading driver signature image',
          );
        }
      }

      // Upload mechanic signature
      const mechanicsSignatureFiles = files.signatureImages.find(
        (file) =>
          defectRequest?.signatures?.mechanicSignature?.imageName ===
          file.originalname,
      );
      if (mechanicsSignatureFiles) {
        try {
          const imageUrl = await awsService.uploadFile(
            mechanicsSignatureFiles.buffer,
            `${tenantId}/${id}/Signatures/${Date.now()}-${
              mechanicsSignatureFiles.originalname
            }`,
          );
          defectRequest.signatures.mechanicSignature.imageUrl =
            imageUrl.Location;
          defectRequest.signatures.mechanicSignature.key = imageUrl.key;
        } catch (error) {
          Logger.error('Error uploading mechanic signature image', error);
          throw new InternalServerErrorException(
            'Error uploading mechanic signature image',
          );
        }
      }
    }
    return defectRequest;
  } catch (error) {
    Logger.error('Error in imagesUpload function', error);
    throw error;
  }
};
