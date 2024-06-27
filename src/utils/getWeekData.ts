import { Logger } from "@nestjs/common";

export const getDistance = (dutyStatuses) => {
  let distance = 0;
  dutyStatuses.map((element, index) => {
    distance += Number(element.accumulatedVehicleMiles);
  });
  return distance;
};
export const getNext8Days = (dateString) => {
  Logger.log('Incoming date: -----------> ', dateString);
  const result = [];
  const currentDate = new Date(dateString);
  currentDate.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 in UTC

  const formattedStartDate = `${currentDate.getFullYear().toString()}-${(
    currentDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${currentDate.getUTCDate().toString().padStart(2, '0')}`;

  result.push(formattedStartDate);

  Logger.log('Formatted Start Date: ' + formattedStartDate);

  for (let i = 0; i < 6; i++) {
    const nextDate = new Date(currentDate);
    nextDate.setUTCDate(currentDate.getUTCDate() + (i + 1)); // Increment i by 1 to get the correct next date
    Logger.log('Next Date: ------ > ', nextDate);

    const formattedDate = `${nextDate.getFullYear().toString()}-${(
      nextDate.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${nextDate.getUTCDate().toString().padStart(2, '0')}`;
    result.push(formattedDate);
  }

  return result;
};

export const convertHM = (value) => {
  // Hours, minutes and seconds
  let ret = '';
  if (value) {
    const hrs = value / 3600;
    const mins = (value % 3600) / 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    if (hrs > 0) {
      ret +=
        '' + (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) + ':';
    } else {
      ret += '00:';
    }
    if (mins > 0) {
      ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
    } else {
      ret += '00';
    }
  } else {
    ret = '00:00';
  }

  return ret;
};
