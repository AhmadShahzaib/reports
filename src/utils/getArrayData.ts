import { checkSum, eventCheckSum } from 'utils/checkSum';
import { dateFormat, timeFormat } from 'utils/dateTimeFormat';
import states from 'us-state-converter';
import { vinChecksum } from 'utils/vinCheckSum';
import { fileCheckData } from 'utils/fileDataCheck';
import vinValidator from 'vin-validator';
import{getTimeZoneOffset} from 'utils/getTimeZoneOffset'
export const getArrayData = (
  csvObj
) => {
  
  try {
  
      
      const dataArrays = [
        ['ELD File Header Segment:'],
        [
          csvObj.driver.lastName,
          csvObj.driver.firstName,
          csvObj.driver.eldUsername,
          csvObj.driver.driverLicenseIssuingState,
          csvObj.driver.driverLicenseNumber,
          csvObj.driver.lineDataCheckValue,
        ],
        [
          csvObj.coDriver.coDriverLastName ,
          csvObj.coDriver.coDriverFirstName,
          csvObj.coDriver.eldUsernameForCoDriver,
          csvObj.coDriver.lineDataCheckValue
        ],
        [
          csvObj.powerUnitLine.powerUnitNumber,
          csvObj.powerUnitLine.cmvVin,
          csvObj.powerUnitLine.trailerNumber,
          csvObj.powerUnitLine.lineDataCheckValue
        ],
        [
          csvObj.carrierLine.carriersUSDOTNumber,
          csvObj.carrierLine.carrierName,
          csvObj.carrierLine.multiDayBasisUsed,
          csvObj.carrierLine.HourPeriodStartingTime,
          csvObj.carrierLine.timeZoneOffsetFromUtc,
          csvObj.carrierLine.lineDataCheckValue
        ],
        [
          csvObj.shippingLine.shippingDocumentNumber,
          csvObj.shippingLine.exemptDriverConfiguration,
          csvObj.shippingLine.lineDataCheckValue
        ],
       [
        csvObj.timePlaceLine.currentDate ,
        csvObj.timePlaceLine.currentTime ,
        csvObj.timePlaceLine.currentLatitude ,
        csvObj.timePlaceLine.currentLongitude ,
        csvObj.timePlaceLine.currentTotalVehicleMiles,
        csvObj.timePlaceLine.currentTotalEngineHours ,
        csvObj.timePlaceLine.lineDataCheckValue 
       ],
        [
          csvObj.eldFileHeaderSegment.eldRegistrationId,
          csvObj.eldFileHeaderSegment.eldIdentifier,
          // generateSignature(csvObj.eldFileHeaderSegment.eldRegistrationId,  csvObj.eldFileHeaderSegment.eldIdentifier, csvObj.powerUnitLine.cmvVin, csvObj.driver.driverLicenseNumber, publicKey),
          csvObj.eldFileHeaderSegment.eldAuthenticationValue,
          csvObj.eldFileHeaderSegment.outputFileComment,
          csvObj.eldFileHeaderSegment.lineDataCheckValue
        ],
        ['User List:'],
        [
          csvObj.userList.assignedUserOrderNumber,
          csvObj.userList.userEldAccountType,
          csvObj.userList.userLastName,
          csvObj.userList.userFirstName,
          csvObj.userList.lineDataCheckValue
        ],
        ['CMV List:'],
        [
          csvObj.cmvList[0].assignedUserCmvOrderNumber,
          csvObj.cmvList[0].cmvPowerUnitNumber,
          csvObj.cmvList[0].cmvVin,
          csvObj.cmvList[0].lineDataCheckValue
        ],
        ['ELD Event List:'],
        ...csvObj.eldEventListForDriversRecordOfDutyStatus.map((item) => {
          
          return [
            item.eventSequenceIdNumber,
            item.eventRecordStatus,
            item.eventRecordOrigin,
            item.eventType,
            item.eventCode,
            item.eventDate,
            item.eventTime,
            item.accumulatedVehicleMiles,
            item.accumulatedEngineHours,
            item.eventLatitude,
            item.eventLongitude,
            item.distanceSinceLastValidCoordinates,
            item.correspondingCmvOrderNumber,
            item.userOrderNumberForRecordOriginator,
            item.malfunctionIndicatorStatusForEld,
            item.dataDiagnosticEventIndicatorForDriver,
            item.eventDataCheckValue,
            item.lineDataCheckValue
            
          ];
        }),
        ['ELD Event Annotations or Comments:'],
        ...csvObj.eventAnnotationsCommentsAndDriverLocation.map((item)=>{
          return[
            item.eventSequenceIdNumber ,
            item.eldUsernameOfRecordOriginator ,
            item.eventCommentOrAnnotation ,
            item.eventDate ,
            item.eventTime ,
            item.driverLocationDescription ,
            item.lineDataCheckValue 
  
          ]
        }),
        ["Driver's Certification/Recertification Actions:"],
        ...csvObj.eldEventListForDriverCertificationOfOwnRecords.map((item)=>{
          return[
            item.eventSequenceIdNumber ,
            item.eventCode ,
            item.eventDate ,
            item.eventTime ,
            item.dateOfTheCertifiedRecord ,
            item.correspondingCmvOrderNumber ,
            item.lineDataCheckValue 
          ]
        }),
        ['Malfunctions and Data Diagnostic Events:'],
        ...csvObj.malfunctionsAndDiagnosticEventRecords.map((item)=>{
          return[
            item.eventSequenceIdNumber ,
          item.eventCode ,
          item.malfunctionOrDiagnosticCode ,
          item.eventDate ,
          item.eventTime ,
          item.totalVehicleMiles ,
          item.totalEngineHours ,
          item.correspondingCmvOrderNumber ,
          item.lineDataCheckValue 
          ]
        }),
        ['ELD Login/Logout Report:'],
        ...csvObj.eldLoginLogoutReport.map((item) => {
         return[
          item.eventSequenceIdNumber ,
          item.eventCode ,
          item.eldUsername ,
          item.eventDate ,
          item.eventTime ,
          item.totalVehicleMiles ,
          item.totalEngineHours ,
          item.lineDataCheckValue 
         ]
          
        }),
        //
        ['CMV Engine Power-Up and Shut Down Activity:'],
        ...csvObj.cmvEnginePowerUpShutDownActivity.map((item) => {
         
          return [
            item.eventSequenceIdNumber ,
            item.eventCode ,
            item.eventDate ,
            item.eventTime ,
            item.totalVehicleMiles ,
            item.totalEngineHours ,
            item.eventLatitude ,
            item.eventLongitude ,
            item.cmvPowerUnitNumber ,
            item.cmvVin ,
            item.trailerNumber ,
            item.shippingDocumentNumber ,
            item.lineDataCheckValue 
          ];
        }),
        //
        ['Unidentified Driver Profile Records:'],
        ...csvObj.eventLogListForUnidentifiedDriverProfile.map((item)=>{
          return[
            item.eventSequenceIdNumber ,
          item.eventRecordStatus ,
          item.eventRecordOrigin ,
          item.eventType ,
          item.eventCode ,
          item.eventDate ,
          item.eventTime ,
          item.accumulatedVehicleMiles ,
          item.accumulatedEngineHours ,
          item.eventLatitude ,
          item.eventLongitude ,
          item.distanceSinceLastValidCoordinates ,
          item.correspondingCmvOrderNumber ,
          item.malfunctionIndicatorStatusForEld ,
          item.eventDataCheckValue ,
          item.lineDataCheckValue 
          ]
        }),
        ['End of File:'],
        [csvObj.fileDataCheckLine.fileDataCheckValue],
      ];
      
    


    return dataArrays;
  } catch (error) {
    return error;
  }
};
