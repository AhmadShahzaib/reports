import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { AppService } from 'services/app.service';
import { SignService } from 'services/signService';
import { getDriverSign } from './getSignPath';
import { graphUpdatedData } from './updatedGraphData';
import getTimeZoneDateRangeForDay from '@shafiqrathore/logeld-tenantbackend-common-future';
import { Logger } from '@nestjs/common';

export const getLogsFormData = async (
  date: string,
  id: string,
  tripInspectionService: AppService,
  serviceSign: SignService,
  awsService: AwsService,
  tenantId: string,
  companyTimeZone: string,
) => {
  try {
    let formData = {};
    let logsForm = {};
    const unitData = await tripInspectionService.getUnitData(id);
let terminal;
    const data = await serviceSign.findLogForm(id, date, companyTimeZone);
    if (data) {
      logsForm = Object.keys(data['_doc']).length > 0 ? data['_doc'] : {};
    }
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    // Check if the input matches the pattern
    if( objectIdPattern.test(unitData.homeTerminalAddress)){
      Logger.log(unitData.homeTerminalAddress);

      terminal = await tripInspectionService.getTerminal(unitData.homeTerminalAddress);
      Logger.log(terminal);

      logsForm['homeTerminalAddress'] =  terminal?.address 
    }else {
      logsForm['homeTerminalAddress'] =  unitData.homeTerminalAddress 
    }
    if(tenantId){
      const tenant = await tripInspectionService.getTenent(tenantId);
      logsForm['headOffice'] =  tenant?.address 
      logsForm['carrier'] = tenant.name ?? null;
    }
    if (unitData) {
     
      logsForm['homeTerminalAddressId'] =
        unitData.homeTerminalAddressId ?? null;
    
      logsForm['headOfficeId'] = unitData.headOfficeId ?? null;
    

      logsForm['vehicleId'] = unitData.vehicleId ?? null;
      logsForm['manualVehicleId'] = unitData.currentVehicle ?? null;
      logsForm['driverId'] = unitData._id ?? null;
      logsForm['manualDriverId'] = unitData.driverId ?? null;
      logsForm['driverFirstName'] = unitData.firstName ?? null;
      logsForm['driverLastName'] = unitData.lastName ?? null;
      logsForm['totalEngineHours'] =  null;
      logsForm['totalVehicleMiles'] =  null;
    }
    formData = await getDriverSign(data, logsForm, awsService);
    let stringLogform = JSON.stringify(formData);
    formData = JSON.parse(stringLogform)
    const resGraph: any = await tripInspectionService.getLogsBetweenRange(
      logsForm['driverId'],
      date,
      date,
    );
    let distance = 0;
    let engineHours = 0;

    if (resGraph?.data?.length > 0) {
      let dutyLogs =
        resGraph?.data[0].csv?.eldEventListForDriversRecordOfDutyStatus;
        dutyLogs = dutyLogs.filter((e)=>{
         return e.eventRecordStatus != 2
        })
        dutyLogs = dutyLogs.sort((a, b) => a.eventTime.localeCompare(b.eventTime));
      if (dutyLogs.length > 1) {
        const lastLogInfo = resGraph?.data[0]?.meta?.deviceCalculations?.lastLogTime
        if(((lastLogInfo?.eventCode == "3" && lastLogInfo?.eventType == "1") || (lastLogInfo?.eventCode == "1" && lastLogInfo?.eventType == "3") || (lastLogInfo?.eventCode == "2" && lastLogInfo?.eventType == "3")) && lastLogInfo?.eventTime<="230000" ){
            dutyLogs.shift()

        }
        for (let i = 0; i < dutyLogs.length - 1; i++) {
          let currentLogDistance =
            Number(dutyLogs[i + 1].totalVehicleMilesDutyStatus) -
            Number(dutyLogs[i].totalVehicleMilesDutyStatus);
          if (i == 0) {
            if (Number(dutyLogs[0].totalVehicleMilesDutyStatus) == 0) {
              currentLogDistance = 0;
            }
          }
          if (currentLogDistance > 0) {
            distance += currentLogDistance;
          }
        }
      } else {
        distance = 0;
      }
      engineHours =
        resGraph?.data[0].csv?.timePlaceLine?.currentTotalEngineHours;
    }
    formData['distance'] = distance;
    
      const csvOfDate = resGraph.data[0];
      const csvDataOfDutyStatus =
        csvOfDate.csv.eldEventListForDriversRecordOfDutyStatus; // get all the duty statuses
      csvDataOfDutyStatus.sort((a, b) =>
        a.eventTime.localeCompare(b.eventTime),
      );

      const shippingIds = [];
      const trailerIds = [];
      const vehicleIds = [];
      csvDataOfDutyStatus.forEach((record) => {
        if (!shippingIds.includes(record.shippingId)) {
          shippingIds.push(record.shippingId);
        }
        if (!trailerIds.includes(record.trailerId)) {
          trailerIds.push(record.trailerId);
        }
        if (!vehicleIds.includes(record.vehicleId)) {
          vehicleIds.push(record.vehicleId);
        }
      });

      formData['shippingDocument'] = shippingIds;
      formData['trailerNumber'] = trailerIds;
      formData['manualVehicleId'] = vehicleIds.toString() ?? null;
    console.log("\n\n\n\n ::" + data)
    let mostRecent;
    let notPresentLogform = false;

   
    if(logsForm["notes"]){

      formData['notes'] = logsForm["notes"];
    }
    return { logForm: formData, notPresentLogform: notPresentLogform };
  } catch (err) {
    throw err;
  }
};
//91 to 167
 // if (data && data['_doc'] && data['_doc']['trailerNumber']) {
    //   formData['trailerNumber'] = data['_doc']['trailerNumber'];
    // } else {
    //   mostRecent = await serviceSign.findLogFormMostRecent(id, date, companyTimeZone);
    //   // Handle the case when data, data['_doc'], or data['_doc']['trailerNumber'] is null
    //   notPresentLogform = true;

    //   if (
    //     mostRecent &&
    //     mostRecent['_doc'] &&
    //     mostRecent['_doc']['trailerNumber']
    //   ) {
    //     const trailerNumberArray = mostRecent['_doc']['trailerNumber'];

    //     if (
    //       Array.isArray(trailerNumberArray) &&
    //       trailerNumberArray.length > 0
    //     ) {
    //       formData['trailerNumber'] = [
    //         trailerNumberArray[trailerNumberArray.length - 1],
    //       ];
    //       Logger.log(
    //         "in if trailer number" +
    //           trailerNumberArray[trailerNumberArray.length - 1],
    //       );
    //     } else {
    //       formData['trailerNumber'] = [];
    //       Logger.log("in else trailer number");
    //     }
    //   } else {
    //     formData['trailerNumber'] = [];
    //     Logger.log("in outer else trailer number");
    //   }
    // }

    // if (data && data['_doc'] && data['_doc']['shippingDocument']) {
    //   formData['shippingDocument'] = data['_doc']['shippingDocument'];
    // } else {
    //   // Handle the case when data, data['_doc'], or data['_doc']['trailerNumber'] is null
    //   mostRecent = await serviceSign.findLogFormMostRecent(
    //     id,
    //     date,
    //     companyTimeZone,
    //   );
    //   notPresentLogform = true;

    //   if (
    //     mostRecent &&
    //     mostRecent['_doc'] &&
    //     mostRecent['_doc']['shippingDocument']
    //   ) {
    //     const shippingDocumentArray = mostRecent['_doc']['shippingDocument'];

    //     if (
    //       Array.isArray(shippingDocumentArray) &&
    //       shippingDocumentArray.length > 0
    //     ) {
    //       formData['shippingDocument'] = [
    //         shippingDocumentArray[shippingDocumentArray.length - 1],
    //       ];
    //       Logger.log(
    //         "in if shipping number" +
    //           shippingDocumentArray[shippingDocumentArray.length - 1],
    //       );
    //       if(shippingDocumentArray[shippingDocumentArray.length - 1]=="0"){
    //         Logger.log("In shipping id 0")
    //         formData['shippingDocument'] =[]
    //       }
    //     } else {
    //       formData['shippingDocument'] = [];
    //       Logger.log("in else shipping number");
    //     }
    //   } else {
    //     Logger.log("in outer else shipping number");
    //     formData['shippingDocument'] = [];
    //   }
    // }