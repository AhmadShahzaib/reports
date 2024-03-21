import { eventCheckSum, checkSum } from './checkSum';

export const getEventPower = (newLog: any) => {
  let dataStr = '';
  Object.keys(newLog).map((item) => {
    if (
      item != 'eventDataCheckValue' &&
      item != 'lineDataCheckValue' &&
      item != 'notes' &&
      item != 'address' &&
      item != 'eventType' &&
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
      item != 'violation' &&
      item!= 'certificateType'
    ) {
      dataStr += newLog[item];
    }
  });
  let logCheckSum = {};
  //   let eventChecksum = eventCheckSum(dataStr);
  //   newLog['eventDataCheckValue'] = eventChecksum.hexa;
  let result = checkSum(dataStr);
  newLog['lineDataCheckValue'] = result.hexa;
  return newLog;
};
