// import { raw } from "@nestjs/mongoose";
import { getTimeZoneDateRangeForDay } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { time } from 'console';
import { last } from 'lodash';
import moment from 'moment';

export const convertICDtoV1 = (
  csvData,
  driverId,
  tenantId,
  companyTimeZone,
) => {
  const allLoginLogoutLogs = csvData.eldLoginLogoutReport;
  let allLogs = JSON.parse(
    JSON.stringify(csvData.eldEventListForDriversRecordOfDutyStatus),
  );
  allLogs = allLogs.filter((element) => {
    return element.eventRecordStatus != '2';
  });

  // allLogs = allLogs.filter((item,index)=>{
  //     return item.eventRecordStatus=="1"

  // })
  allLogs = allLogs.sort((a, b) => a.eventTime - b.eventTime);
  const allPowerupPowerdown = csvData.cmvEnginePowerUpShutDownActivity;
  const certification = csvData.eldEventListForDriverCertificationOfOwnRecords;
  const nawLog = {
    status: '',
    startedAt: 0,

    lastStartedAt: 0,

    totalSecondsSpentSoFar: 0,
    actionDate: 0,
    odoMeterMillage: 0,
    odoMeterSpeed: 0,
    engineHours: 0,
    vehicleManualId: 'TEST123',
    geoLocation: {
      longitude: 0,
      latitude: 0,
      address: 'Plot C 81, Sector C DHA Phase 6, Lahore, Punjab, Pakistan',
    },
    driver: {
      id: '63b54dc3ea2996033a298909',
      tenantId: '62fe35761bcceaabb99f556f',
      firstName: 'TEST',
      lastName: 'ALPHA',
    },
    id: '641aea69615ceef1f9be2cd0',
    violations: [],
    deviceType: 'android',
    editRequest: [],
    updated: [],
    actionType: 'ON_DUTY_NOT_DRIVING',
    sequenceNumber: 3,
    notes: '',
    eventRecordStatus: '',
    eventRecordOrigin: '',
    eventType: '',
  };

  const allRawLog = [];
  const graph = JSON.parse(JSON.stringify(allLogs));

  const filteredGraph = graph.filter((item) => {
    return (
      (item.eventType != '2' && item.eventCode != '1') ||
      (item.eventType != '2' && item.eventCode != '2')
    );
  });
  const inter = graph.filter((item) => {
    return !(
      (item.eventType != '2' && item.eventCode != '1') ||
      (item.eventType != '2' && item.eventCode != '2')
    );
  });

  allLogs = filteredGraph;
  allLogs.forEach((item, index) => {
    // if(index + 1 < allLogs.length){
    const rawLog = JSON.parse(JSON.stringify(nawLog));
    rawLog.status =
      item.eventCode == '1'
        ? 'OFF DUTY'
        : item.eventCode == '4'
        ? 'ON DUTY'
        : item.eventCode == '3'
        ? 'ON DRIVING'
        : item.eventCode == '2'
        ? 'ON SB'
        : 'OFF DUTY';
    rawLog.actionType =
      item.eventCode == '1'
        ? 'OFF_DUTY'
        : item.eventCode == '4'
        ? 'ON_DUTY_NOT_DRIVING'
        : item.eventCode == '3'
        ? 'DRIVING'
        : item.eventCode == '2'
        ? 'SLEEPER_BERTH'
        : 'OFF_DUTY';
    if (
      item.eventType == '2' &&
      (item.eventCode == '1' || item.eventCode == '2')
    ) {
      rawLog.status = 'INT';
      rawLog.actionType = 'INT';
      rawLog.eventType = 'Int. Location';
      rawLog.eventCode = 'INT';
    }
    if (item.eventCode == '2' && item.eventType == '3') {
      rawLog.status = 'ON DUTY';
      rawLog.actionType = 'ON_DUTY_NOT_DRIVING';
      rawLog.eventType = 'ON DUTY (YM)';
      rawLog.eventCode = 'YM';
    }
    if (item.eventCode == '1' && item.eventType == '3') {
      rawLog.status = 'OFF DUTY';
      rawLog.actionType = 'OFF_DUTY';
      rawLog.eventType = 'OFF DUTY (PC)';
      rawLog.eventCode = 'PC';
    }
    if (item.eventRecordOrigin == '1') {
      rawLog.eventRecordOrigin = 'AUTO';
    }
    if (item.eventRecordOrigin == '2') {
      rawLog.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '3') {
      rawLog.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '4') {
      rawLog.eventRecordOrigin = 'UNIDENTIFIED';
    }

    const startTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    let lastTime;

    if (index + 1 < allLogs.length) {
      const testString =
        allLogs[index + 1].eventDate + allLogs[index + 1].eventTime;

      lastTime = moment(
        allLogs[index + 1].eventDate + allLogs[index + 1].eventTime,
        'MMDDYYHHmmss',
      ).unix();
    } else {
      lastTime = startTime;
    }
    const drv = {
      id: driverId,
      tenantId: tenantId,
      firstName: csvData.driver.firstName,
      lastName: csvData.driver.lastName,
    };
    let addressOf = '';
    if (item.address) {
      addressOf = item.address;
    }
    const location = {
      longitude: item.eventLongitude,
      latitude: item.eventLatitude,

      address: addressOf,
    };
    rawLog.geoLocation = location;

    rawLog.driver = drv;
    rawLog.lastStartedAt = lastTime;
    rawLog.totalSecondsSpentSoFar = lastTime - startTime;
    rawLog.actionDate = lastTime;
    rawLog.startedAt = startTime;
    if (csvData.powerUnitLine.powerUnitNumber) {
      rawLog.vehicleManualId = csvData.powerUnitLine.powerUnitNumber;
    }

    rawLog.odoMeterMillage = Number(item.totalVehicleMilesDutyStatus + '');
    // if(Number.isNaN(rawLog.totalEngineHoursDutyStatus)){
    //   rawLog.totalEngineHoursDutyStatus = 0
    // }
    rawLog.engineHours = Number(item.totalEngineHoursDutyStatus + '');
    // if(Number.isNaN(rawLog.engineHours)){
    //   rawLog.engineHours = 0
    // }
    rawLog.sequenceNumber = item.eventSequenceIdNumber;

    if (item.notes) {
      rawLog.notes = item.notes;
    }
    const currentDate = moment().format('MMDDYY').toString();

    if (index == allLogs.length - 1) {
      if (currentDate != item.eventDate) {
        const last = moment(
          allLogs[index].eventDate + '235959',
          'MMDDYYHHmmss',
        ).unix();
        rawLog.lastStartedAt = last;
      } else {
        const newtime = new Date();
        const options = {
          timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
        };
        const nowinstring = newtime.toLocaleString('en-US', options);
        const now = new Date(Date.parse(nowinstring));
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const hhmmss = hours + minutes + seconds;
        const last = moment(
          allLogs[index].eventDate + hhmmss,
          'MMDDYYHHmmss',
        ).unix();
        rawLog.lastStartedAt = last;
      }
    }

    allRawLog.push(rawLog);

    // }
  });
  const allLogin = [];
  allLoginLogoutLogs.map((item, index) => {
    const login = JSON.parse(JSON.stringify(nawLog));

    if (item.eventCode == '1') {
      login.status = 'LOGIN';
      login.eventType = 'LOGIN';
      login.actionType = 'LOGIN';
    }
    if (item.eventCode == '2') {
      login.status = 'LOGOUT';
      login.eventType = 'LOGOUT';
      login.actionType = 'LOGOUT';
    }
    login.eventRecordOrigin = 'AUTO';
    if (item.eventRecordOrigin == '1') {
      login.eventRecordOrigin = 'AUTO';
    }
    if (item.eventRecordOrigin == '2') {
      login.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '3') {
      login.eventRecordOrigin = 'ADMIN';
    }
    if (item.eventRecordOrigin == '4') {
      login.eventRecordOrigin = 'UNIDENTIFIED';
    }
    const startTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const lastTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const drv = {
      id: driverId,
      tenantId: tenantId,
      firstName: csvData.driver.firstName,
      lastName: csvData.driver.lastName,
    };
    let addressOf = '';
    if (item.address) {
      addressOf = item.address;
    }
    const location = {
      longitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLongitude,
      latitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLatitude,
      address: addressOf,
    };
    login.geoLocation = location;

    login.driver = drv;
    login.lastStartedAt = lastTime;
    login.totalSecondsSpentSoFar = 0;
    login.actionDate = lastTime;
    login.startedAt = startTime;
    if (csvData.powerUnitLine.powerUnitNumber) {
      login.vehicleManualId = csvData.powerUnitLine.powerUnitNumber;
    }

    login.odoMeterMillage = Number(item.totalVehicleMilesDutyStatus + '');
    login.engineHours = Number(item.totalEngineHoursDutyStatus + '');
    if (Number.isNaN(login.odoMeterMillage)) {
      login.odoMeterMillage = 0;
    }

    if (Number.isNaN(login.engineHours)) {
      login.engineHours = 0;
    }
    login.sequenceNumber = item.eventSequenceIdNumber;
    delete login.lastStartedAt;
    allLogin.push(login);
  });
  const allpower = [];
  allPowerupPowerdown.map((item, index) => {
    const power = JSON.parse(JSON.stringify(nawLog));

    if (item.eventCode == '4' || item.eventCode == '3') {
      power.status = 'EV_ENGINE_OFF';
      power.eventType = 'POWER OFF';
      power.actionType = 'EV_ENGINE_OFF';
    }
    if (item.eventCode == '2' || item.eventCode == '1') {
      power.status = 'EV_ENGINE_ON';
      power.eventType = 'POWER ON';
      power.actionType = 'EV_ENGINE_ON';
    }
    power.eventRecordOrigin = 'AUTO';
    if (item.eventRecordOrigin == '1') {
      power.eventRecordOrigin = 'AUTO';
    }
    if (item.eventRecordOrigin == '2') {
      power.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '3') {
      power.eventRecordOrigin = 'ADMIN';
    }
    if (item.eventRecordOrigin == '4') {
      power.eventRecordOrigin = 'UNIDENTIFIED';
    }
    const startTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const lastTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const drv = {
      id: driverId,
      tenantId: tenantId,
      firstName: csvData.driver.firstName,
      lastName: csvData.driver.lastName,
    };
    let addressOf = '';
    if (item.address) {
      addressOf = item.address;
    }
    const location = {
      longitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLongitude,
      latitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLatitude,
      address: addressOf,
    };
    power.geoLocation = location;

    power.driver = drv;
    power.lastStartedAt = lastTime;
    power.totalSecondsSpentSoFar = 0;
    power.actionDate = lastTime;
    power.startedAt = startTime;
    if (csvData.powerUnitLine.powerUnitNumber) {
      power.vehicleManualId = csvData.powerUnitLine.powerUnitNumber;
    }

    power.odoMeterMillage = Number(item.totalVehicleMilesDutyStatus + '');
    power.engineHours = Number(item.totalEngineHoursDutyStatus + '');
    if (Number.isNaN(power.odoMeterMillage)) {
      power.odoMeterMillage = 0;
    }

    if (Number.isNaN(power.engineHours)) {
      power.engineHours = 0;
    }
    power.sequenceNumber = item.eventSequenceIdNumber;
    delete power.lastStartedAt;
    allpower.push(power);
  });
  const int = [];
  inter.map((item, index) => {
    const intermediate = JSON.parse(JSON.stringify(nawLog));

    if (item.eventCode == '1') {
      intermediate.status = 'LOGIN';
      intermediate.eventType = 'LOGIN';
      intermediate.actionType = 'LOGIN';
    }
    if (item.eventCode == '2') {
      intermediate.status = 'LOGOUT';
      intermediate.eventType = 'LOGOUT';
      intermediate.actionType = 'LOGOUT';
    }
    if (
      item.eventType == '2' &&
      (item.eventCode == '1' || item.eventCode == '2')
    ) {
      intermediate.status = 'INT';
      intermediate.actionType = 'INT';
      intermediate.eventType = 'Int. Location';
      intermediate.eventCode = 'INT';
    }
    intermediate.eventRecordOrigin = 'AUTO';
    if (item.eventRecordOrigin == '1') {
      intermediate.eventRecordOrigin = 'AUTO';
    }
    if (item.eventRecordOrigin == '2') {
      intermediate.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '3') {
      intermediate.eventRecordOrigin = 'ADMIN';
    }
    if (item.eventRecordOrigin == '4') {
      intermediate.eventRecordOrigin = 'UNIDENTIFIED';
    }
    const startTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const lastTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const drv = {
      id: driverId,
      tenantId: tenantId,
      firstName: csvData.driver.firstName,
      lastName: csvData.driver.lastName,
    };
    let addressOf = '';
    if (item.address) {
      addressOf = item.address;
    }
    const location = {
      longitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLongitude,
      latitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLatitude,
      address: addressOf,
    };
    intermediate.geoLocation = location;

    intermediate.driver = drv;
    intermediate.lastStartedAt = lastTime;
    intermediate.totalSecondsSpentSoFar = 0;
    intermediate.actionDate = lastTime;
    intermediate.startedAt = startTime;
    if (csvData.powerUnitLine.powerUnitNumber) {
      intermediate.vehicleManualId = csvData.powerUnitLine.powerUnitNumber;
    }

    intermediate.odoMeterMillage = Number(
      item.totalVehicleMilesDutyStatus + '',
    );
    intermediate.engineHours = Number(item.totalEngineHoursDutyStatus + '');
    if (Number.isNaN(intermediate.odoMeterMillage)) {
      intermediate.odoMeterMillage = 0;
    }

    if (Number.isNaN(intermediate.engineHours)) {
      intermediate.engineHours = 0;
    }
    intermediate.sequenceNumber = item.eventSequenceIdNumber;
    delete intermediate.lastStartedAt;
    int.push(intermediate);
  });
  const certi = [];
  certification.map((item, index) => {
    const certify = JSON.parse(JSON.stringify(nawLog));

    // if (item.eventCode == '1') {
    //   certify.status = 'LOGIN';
    //   certify.eventType = 'LOGIN';
    //   certify.actionType = 'LOGIN';
    // }
    // if (item.eventCode == '2') {
    //   certify.status = 'LOGOUT';
    //   certify.eventType = 'LOGOUT';
    //   certify.actionType = 'LOGOUT';
    // }
    // if (item.eventType == '2' && (item.eventCode == '1' || item.eventCode == '2') ){
    //   certify.status = 'INT';
    //   certify.actionType = 'INT';
    //   certify.eventType = 'Int. Location';
    //   certify.eventCode = 'INT';
    // }

    if (item.certificateType == '4') {
      certify.status = 'Certification';
      certify.actionType = 'Certification';
      certify.eventType = 'Certification';
      certify.eventCode = 'Certification';
    }
    certify.eventRecordOrigin = 'AUTO';
    if (item.eventRecordOrigin == '1') {
      certify.eventRecordOrigin = 'AUTO';
    }
    if (item.eventRecordOrigin == '2') {
      certify.eventRecordOrigin = 'DRIVER';
    }
    if (item.eventRecordOrigin == '3') {
      certify.eventRecordOrigin = 'ADMIN';
    }
    if (item.eventRecordOrigin == '4') {
      certify.eventRecordOrigin = 'UNIDENTIFIED';
    }
    const startTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const lastTime = moment(
      item.eventDate + item.eventTime,
      'MMDDYYHHmmss',
    ).unix();
    const drv = {
      id: driverId,
      tenantId: tenantId,
      firstName: csvData.driver.firstName,
      lastName: csvData.driver.lastName,
    };
    let addressOf = '';
    if (item.address) {
      addressOf = item.address;
    }
    const location = {
      longitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLongitude,
      latitude:
        csvData.eldEventListForDriversRecordOfDutyStatus[0].eventLatitude,
      address: addressOf,
    };
    certify.geoLocation = location;

    certify.driver = drv;
    certify.lastStartedAt = lastTime;
    certify.totalSecondsSpentSoFar = 0;
    certify.actionDate = lastTime;
    certify.startedAt = startTime;
    if (csvData.powerUnitLine.powerUnitNumber) {
      certify.vehicleManualId = csvData.powerUnitLine.powerUnitNumber;
    }

    certify.odoMeterMillage = Number(item.totalVehicleMilesDutyStatus + '');
    certify.engineHours = Number(item.totalEngineHoursDutyStatus + '');
    if (Number.isNaN(certify.odoMeterMillage)) {
      certify.odoMeterMillage = 0;
    }

    if (Number.isNaN(certify.engineHours)) {
      certify.engineHours = 0;
    }
    certify.sequenceNumber = item.eventSequenceIdNumber;
    delete certify.lastStartedAt;
    certi.push(certify);
  });
  return [...allLogin, ...allpower, ...allRawLog, ...certi, ...int];
};
