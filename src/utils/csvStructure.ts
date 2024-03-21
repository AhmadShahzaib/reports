import moment from 'moment';

export const csvStructure = async () => {
    const csvStructure = {
        "_id": {
          "$oid": "6459db605806e7b1bb01dcd0"
        },
        "day": 9,
        "month": 5,
        "__v": 0,
        "csv": {
          "carrierLine": {
            "HourPeriodStartingTime": "000000",
            "carrierName": "JRT Industry staging",
            "carriersUSDOTNumber": "32328",
            "lineDataCheckValue": "61",
            "multiDayBasisUsed": 7,
            "timeZoneOffsetFromUtc": 6
          },
          "cmvEnginePowerUpShutDownActivity": [],
          "cmvList": [
            {
              "assignedUserCmvOrderNumber": "1",
              "cmvPowerUnitNumber": "1997",
              "cmvVin": "1GKKRNED3FJ160937",
              "lineDataCheckValue": "6E"
            }
          ],
          "coDriver": {
            "coDriverFirstName": "",
            "coDriverLastName": "",
            "eldUsernameForCoDriver": "",
            "lineDataCheckValue": "96"
          },
          "driver": {
            "driverLicenseIssuingState": "CA",
            "driverLicenseNumber": "J1306197",
            "eldUsername": "UN1997",
            "firstName": "Dilawar",
            "lastName": "Khan",
            "lineDataCheckValue": "F1"
          },
          "eldEventListForDriverCertificationOfOwnRecords": [],
          "eldEventListForDriversRecordOfDutyStatus": [
            {
              "accumulatedEngineHours": "0",
              "accumulatedVehicleMiles": "0",
              "address": "0.01 mi NE of Al-Faisal Town, PB",
              "correspondingCmvOrderNumber": "1",
              "dataDiagnosticEventIndicatorForDriver": "0",
              "distanceSinceLastValidCoordinates": 0,
              "eventCode": "4",
              "eventDataCheckValue": "86",
              "eventDate": "050923",
              "eventEndTime": "",
              "eventLatitude": "31.5482386",
              "eventLongitude": "74.4080275",
              "eventRecordOrigin": "2",
              "eventRecordStatus": "1",
              "eventSequenceIdNumber": "2",
              "eventTime": "000000",
              "eventType": "1",
              "lineDataCheckValue": "45",
              "malfunctionIndicatorStatusForEld": "0",
              "notes": "",
              "totalEngineHoursDutyStatus": "0",
              "totalVehicleMilesDutyStatus": "0",
              "userOrderNumberForRecordOriginator": "1"
            },
            {
              "accumulatedEngineHours": "0",
              "accumulatedVehicleMiles": "0",
              "address": "0.02 mi SW of DHA Phase 8, PB",
              "correspondingCmvOrderNumber": "1",
              "dataDiagnosticEventIndicatorForDriver": "0",
              "distanceSinceLastValidCoordinates": 0,
              "eventCode": "3",
              "eventDataCheckValue": "66",
              "eventDate": "050923",
              "eventEndTime": "",
              "eventLatitude": "31.4852088",
              "eventLongitude": "74.4477736",
              "eventRecordOrigin": "2",
              "eventRecordStatus": "1",
              "eventSequenceIdNumber": "3",
              "eventTime": "001110",
              "eventType": "2",
              "lineDataCheckValue": "B2",
              "malfunctionIndicatorStatusForEld": "0",
              "notes": "yy",
              "totalEngineHoursDutyStatus": "0",
              "totalVehicleMilesDutyStatus": "0",
              "userOrderNumberForRecordOriginator": "1"
            }
          ],
          "eldFileHeaderSegment": {
            "eldAuthenticationValue": "ABCDEFGHIJ12334567",
            "eldIdentifier": "TESTXX",
            "eldRegistrationId": "TEST",
            "lineDataCheckValue": "D1",
            "outputFileComment": "GenratorTest"
          },
          "eldLoginLogoutReport": [],
          "eventAnnotationsCommentsAndDriverLocation": [
            {
              "driverLocationDescription": "0.02 mi SW of DHA Phase 8 PB",
              "eldUsernameOfRecordOriginator": "RXE632",
              "eventCommentOrAnnotation": "yy",
              "eventDate": "050923",
              "eventSequenceIdNumber": "3",
              "eventTime": "001110",
              "lineDataCheckValue": "B0"
            }
          ],
          "eventLogListForUnidentifiedDriverProfile": [],
          "fileDataCheckLine": {
            "fileDataCheckValue": "AE06"
          },
          "malfunctionsAndDiagnosticEventRecords": [],
          "powerUnitLine": {
            "cmvVin": "1GKKRNED3FJ160937",
            "lineDataCheckValue": "66",
            "powerUnitNumber": "1997",
            "trailerNumber": ""
          },
          "shippingLine": {
            "exemptDriverConfiguration": "0",
            "lineDataCheckValue": "96",
            "shippingDocumentNumber": ""
          },
          "timePlaceLine": {
            "address": "0.02 mi SW of DHA Phase 8, PB",
            "currentDate": "050923",
            "currentEventCode": "1",
            "currentLatitude": "31.4852088",
            "currentLongitude": "74.4477736",
            "currentTime": "001110",
            "currentTotalEngineHours": "0",
            "currentTotalVehicleMiles": "0",
            "lineDataCheckValue": "E5",
            "speed": "0"
          },
          "userList": {
            "assignedUserOrderNumber": 1,
            "lineDataCheckValue": "CC",
            "userEldAccountType": "D",
            "userFirstName": "Dilawar",
            "userLastName": "Khan"
          }
        },
        "date": "2023-05-09",
        "meta": {
          "clockData": {
            "breakSeconds": 0,
            "cycleSeconds": 49109,
            "driveSeconds": 218756,
            "driveSecondsSplit": 43743,
            "shiftDutySecond": 54585,
            "shiftDutySecondsSplit": 54543,
            "isSplitActive": false
          },
          "dateTime": 1683608425,
          "deviceCalculations": {
            "BREAK_30_MIN": 0,
            "BREAK_ENABLE": false,
            "BREAK_VERIFIED": false,
            "BREAK_VIOLATION": false,
            "CONSECUTIVE_DRIVING": 0,
            "CYCLE_START_DATE": "2023-05-08",
            "DRIVING": 43743,
            "DRIVING_ADDED": 0,
            "DRIVING_COUNTER": 0,
            "DRIVING_CYCLE": 0,
            "DRIVING_NOT_ALLOWED_IN_ONDUTY_VIOLATION": false,
            "DRIVING_NOT_ALLOWED_IN_ONDUTY_WITH_OUT_SPLIT_VIOLATION": false,
            "DRIVING_VIOLATION": false,
            "DRIVING_WITH_OUT_ON_DUTY_ADDED": 0,
            "DRIVING_WITH_OUT_SPLIT": 218756,
            "DVIR_CREATED": true,
            "FIRST_QUALIFY_ENABLE": false,
            "OFF_DUTY": 835,
            "OFF_DUTY_CONSECUTIVE": 0,
            "OFF_DUTY_COUNTER": 2,
            "OFF_DUTY_CYCLE": 1209,
            "OFF_DUTY_SLEEPER_BERTH": 0,
            "ON_DRIVING_CHUNK": 0,
            "ON_DUTY_ADDED": 0,
            "ON_DUTY_COUNTER": 4,
            "ON_DUTY_MAX_HOURS": false,
            "ON_DUTY_NOT_DRIVING": 54543,
            "ON_DUTY_NOT_DRIVING_CHUNK": 61,
            "ON_DUTY_NOT_DRIVING_CYCLE": 49109,
            "ON_DUTY_NOT_DRIVING_WITHOUT_DRIVE": 47632,
            "ON_DUTY_NOT_DRIVING_WITH_OUT_SPLIT": 47632,
            "QUALIFY_ENABLE": false,
            "SB_COUNTER": 2,
            "SHIFT_STARTED": true,
            "SLEEPER_BERTH": 5968,
            "SLEEPER_BERTH_34_HOURS": 0,
            "SLEEPER_BERTH_CONSECUTIVE": 0,
            "SLEEPER_BERTH_CYCLE": 6056,
            "SLEEPER_SPLIT_CHUNK": 0,
            "SPLIT_ACTIVE": false,
            "TOTAL_SHIFT_COUNTER": 54585
          },
          "totalEngineHours": "",
          "totalVehicleMiles": "",
          "voilations": []
        },
        "raw": {
          "carrierLine": {
            "HourPeriodStartingTime": "000000",
            "carrierName": "JRT Industry staging",
            "carriersUSDOTNumber": "32328",
            "lineDataCheckValue": "",
            "multiDayBasisUsed": 7,
            "timeZoneOffsetFromUtc": 6
          },
          "cmvEnginePowerUpShutDownActivity": [],
          "cmvList": [
            {
              "assignedUserCmvOrderNumber": "0",
              "cmvPowerUnitNumber": "1997",
              "cmvVin": "1GKKRNED3FJ160937",
              "lineDataCheckValue": ""
            }
          ],
          "coDriver": {
            "coDriverFirstName": "",
            "coDriverLastName": "",
            "eldUsernameForCoDriver": "",
            "lineDataCheckValue": ""
          },
          "driver": {
            "driverLicenseIssuingState": "CA",
            "driverLicenseNumber": "J1306197",
            "eldUsername": "UN1997",
            "firstName": "Dilawar",
            "lastName": "Khan",
            "lineDataCheckValue": ""
          },
          "eldEventListForDriverCertificationOfOwnRecords": [],
          "eldEventListForDriversRecordOfDutyStatus": [
            {
              "accumulatedEngineHours": "",
              "accumulatedVehicleMiles": "0",
              "address": "",
              "correspondingCmvOrderNumber": "1",
              "dataDiagnosticEventIndicatorForDriver": "false",
              "distanceSinceLastValidCoordinates": 0,
              "eventCode": "ON_DUTY_NOT_DRIVING",
              "eventDataCheckValue": "",
              "eventDate": "",
              "eventEndTime": "",
              "eventLatitude": "31.5482386",
              "eventLongitude": "74.4080275",
              "eventRecordOrigin": "Driver",
              "eventRecordStatus": "Active",
              "eventSequenceIdNumber": "2",
              "eventTime": "",
              "eventType": "change in driver duty status",
              "lineDataCheckValue": "",
              "malfunctionIndicatorStatusForEld": "false",
              "notes": "",
              "totalEngineHoursDutyStatus": "",
              "totalVehicleMilesDutyStatus": "",
              "userOrderNumberForRecordOriginator": "1"
            },
            {
              "accumulatedEngineHours": "",
              "accumulatedVehicleMiles": "",
              "address": "",
              "correspondingCmvOrderNumber": "1",
              "dataDiagnosticEventIndicatorForDriver": "false",
              "distanceSinceLastValidCoordinates": 0,
              "eventCode": "OFF_DUTY",
              "eventDataCheckValue": "",
              "eventDate": "",
              "eventEndTime": "",
              "eventLatitude": "31.4852088",
              "eventLongitude": "74.4477736",
              "eventRecordOrigin": "Driver",
              "eventRecordStatus": "Active",
              "eventSequenceIdNumber": "3",
              "eventTime": "",
              "eventType": "change in driver duty status",
              "lineDataCheckValue": "",
              "malfunctionIndicatorStatusForEld": "false",
              "notes": "",
              "totalEngineHoursDutyStatus": "0",
              "totalVehicleMilesDutyStatus": "0",
              "userOrderNumberForRecordOriginator": "1"
            }
          ],
          "eldFileHeaderSegment": {
            "eldAuthenticationValue": "EBECEDEEEFEGEHEIEJE1DBDCDDDDDEDFDGDH",
            "eldIdentifier": "TEKELD",
            "eldRegistrationId": "38OH",
            "lineDataCheckValue": "",
            "outputFileComment": "GenratorTest"
          },
          "eldLoginLogoutReport": [],
          "eventAnnotationsCommentsAndDriverLocation": [
            {
              "driverLocationDescription": "0.02 mi SW of DHA Phase 8 PB",
              "eldUsernameOfRecordOriginator": "RXE632",
              "eventCommentOrAnnotation": "yy",
              "eventDate": "050923",
              "eventSequenceIdNumber": "3",
              "eventTime": "001110",
              "lineDataCheckValue": ""
            }
          ],
          "eventLogListForUnidentifiedDriverProfile": [],
          "fileDataCheckLine": {
            "fileDataCheckValue": ""
          },
          "malfunctionsAndDiagnosticEventRecords": [],
          "powerUnitLine": {
            "cmvVin": "1GKKRNED3FJ160937",
            "lineDataCheckValue": "",
            "powerUnitNumber": "1997",
            "trailerNumber": ""
          },
          "shippingLine": {
            "exemptDriverConfiguration": "0",
            "lineDataCheckValue": "",
            "shippingDocumentNumber": ""
          },
          "timePlaceLine": {
            "address": "",
            "currentDate": "050923",
            "currentEventCode": "",
            "currentLatitude": "",
            "currentLongitude": "",
            "currentTime": "001110",
            "currentTotalEngineHours": "0",
            "currentTotalVehicleMiles": "0",
            "lineDataCheckValue": "",
            "speed": ""
          },
          "userList": {
            "assignedUserOrderNumber": 1,
            "lineDataCheckValue": "",
            "userEldAccountType": "D",
            "userFirstName": "Dilawar",
            "userLastName": "Khan"
          }
        },
        "userId": "6457bd89a09d622e0fb51c3b"
      }
      return csvStructure
  };
  
