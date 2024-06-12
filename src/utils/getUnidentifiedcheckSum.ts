import { eventCheckSum, checkSum } from './checkSum';

export const getUnidentifiedcheckSum = (newLog: any) => {
  let dataStr = '';
  const log = {};
  Object.keys(newLog).map((item) => {
    if (
      item != 'lineDataCheckValue' &&
      item != 'reason' &&
      item != 'eventDataCheckValue' &&
      item != 'notes' &&
      item != 'address' &&
      item != 'eventEndTime' &&
      item != 'currentEventCode' &&
      item != 'totalVehicleMilesDutyStatus' &&
      item != 'totalEngineHoursDutyStatus' &&
      item != 'speed' &&
      item != 'distance' &&
      item != 'duration' &&
      item != 'origin' &&
      item != 'destination' &&
      item != 'vehicleId' &&
      item != 'eventSynced' &&
      item != 'startEngineHour' &&
      item != 'endEngineHour' &&
      item != 'startVehicleMiles' &&
      item != 'endVehicleMiles' &&
      item != 'state' &&
      item != 'eventTypeExtra' &&
      item != 'cmvVinNo' &&
      item != 'isRejected' &&
      item != 'eldNumber'

    ) {
      dataStr += newLog[item];
      log[item] = newLog[item];
    }
  });
  const logCheckSum = {};
  console.log(log);

  //   let eventChecksum = eventCheckSum(dataStr);
  //   newLog['eventDataCheckValue'] = eventChecksum.hexa;
  const result = checkSum(dataStr);
  newLog['lineDataCheckValue'] = result.hexa;
  newLog['eventDataCheckValue'] = eventCheckSum(dataStr).hexa;
  return newLog;
};
