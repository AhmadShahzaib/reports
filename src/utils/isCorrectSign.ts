import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { AppService } from 'services/app.service';
import { SignService } from 'services/signService';
import { getDriverSign } from './getSignPath';
import { graphUpdatedData } from './updatedGraphData';
import getTimeZoneDateRangeForDay from '@shafiqrathore/logeld-tenantbackend-common-future';
import mongoose, { Model } from 'mongoose';
import { DriverSignSchema } from 'mongoDb/schema/driverSign';
import { dbConnection } from './db.connection';
export const checkSign = async (
  signature:string,
  id: string,
  tripInspectionService: AppService,
  serviceSign: SignService,
  awsService: AwsService,
  companyTimeZone: string,
) => {
    try {
        await dbConnection();
       const collectionName = `driversigns`
      const dynamicModel = mongoose.model(
        `${collectionName}`,
        DriverSignSchema,
        collectionName,
      );
         const query = {
        'driverId': id,
      };
      const result = await dynamicModel.find(query).lean();

      let flag = false
      result.map((element) => { 
        if (element?.sign?.imageUrl == signature) { 
          flag = true
        }
        

      })
    return flag
    // let unitData = await tripInspectionService.getUnitData(id);

    // const data = await serviceSign.findLogForm(id, date, companyTimeZone);
    // if (data) {
    //   logsForm = Object.keys(data['_doc']).length > 0 ? data['_doc'] : {};
    // }
    // if (unitData) {
    //   logsForm['carrier'] = unitData.carrier ?? null;
    //   logsForm['homeTerminalAddressId'] =
    //     unitData.homeTerminalAddressId ?? null;
    //   logsForm['homeTerminalAddress'] = unitData.homeTerminalAddress ?? null;
    //   logsForm['headOfficeId'] = unitData.headOfficeId ?? null;
    //   logsForm['headOffice'] = unitData.headOffice ?? null;
    //   logsForm['trailerNumber'] = unitData.trailerNumber ?? null;
    //   logsForm['vehicleId'] = unitData.vehicleId ?? null;
    //   logsForm['manualVehicleId'] = unitData.manualVehicleId ?? null;
    //   logsForm['driverId'] = unitData.driverId ?? null;
    //   logsForm['manualDriverId'] = unitData.manualDriverId ?? null;
    //   logsForm['driverFirstName'] = unitData.driverFirstName ?? null;
    //   logsForm['driverLastName'] = unitData.driverLastName ?? null;
    //   logsForm['totalEngineHours'] = unitData?.meta?.totalEngineHours ?? null;
    //   logsForm['totalVehicleMiles'] = unitData?.meta?.totalVehicleMiles ?? null;
    // }
    // formData = await getDriverSign(data, logsForm, awsService);
    // let resGraph: any = await tripInspectionService.getLogsBetweenRange(
    //   logsForm['driverId'],
    //   date,
    //   date,
    // );
    // let distance = 0;
    // let engineHours = 0;

    // if (resGraph?.data.length > 0) {
    //   let dutyLogs =
    //     resGraph?.data[0].csv?.eldEventListForDriversRecordOfDutyStatus;
    //   if (dutyLogs.length > 1) {
    //     for (let i = 0; i < dutyLogs.length - 1; i++) {
    //       if (
    //         Number(dutyLogs[i + 1].totalVehicleMilesDutyStatus) != 0 &&
    //         Number(dutyLogs[i].totalVehicleMilesDutyStatus) != 0
    //       ) {
    //         distance +=
    //           Number(dutyLogs[i + 1].totalVehicleMilesDutyStatus) -
    //           Number(dutyLogs[i].totalVehicleMilesDutyStatus);
    //       }
    //     }
    //   } else {
    //     distance = 0;
    //   }
    //   // dutyLogs.forEach(element => {
    //   //   distance +=  Number(element.accumulatedVehicleMiles);
    //   // });
    //   engineHours =
    //     resGraph?.data[0].csv?.timePlaceLine?.currentTotalEngineHours;
    // }
    // formData['distance'] = distance;

    // return formData;
  } catch (err) {
    throw err;
  }
};
