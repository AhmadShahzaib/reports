import { eventCheckSum, checkSum } from './checkSum';

export const getLogChecksum = (newLog: any) => {
  let dataStr = '';
  Object.keys(newLog).map((item) => {
    if (
      item != 'eventDataCheckValue' &&
      item != 'lineDataCheckValue' &&
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
      item != 'trailerId' &&
      item != 'shippingId' &&

      item != 'eventSynced' &&
      item != 'startEngineHour' &&
      item != 'endEngineHour' &&
      item != 'startVehicleMiles' &&
      item != 'endVehicleMiles' &&
      item != 'state' &&
      item != 'SHIFT_START_DATE' &&
      item != 'CYCLE_START_DATE' &&
      item != 'isOdometer' &&
      item != 'isEngineHours' &&
      item != 'intermediateType' &&
      item != 'speedMph' &&
      item != 'vinNumber' &&
      item != 'speedViolation' &&
      item != 'speedMph' &&
      item != 'violation'
    ) {
      dataStr += newLog[item];
    }
  });
  const logCheckSum = {};
  const eventChecksum = eventCheckSum(dataStr);
  newLog['eventDataCheckValue'] = eventChecksum.hexa;
  const result = checkSum(dataStr + eventChecksum.hexa);
  newLog['lineDataCheckValue'] = result.hexa;
  return newLog;
};
