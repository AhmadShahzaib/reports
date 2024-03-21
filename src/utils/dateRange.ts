export const dateRangeForDriverLog = (startDateEpoch, endDateEpoch) => {
    return {
      'inspectionTime': {
        '$gte': startDateEpoch,
        '$lte': endDateEpoch
      }
    }
  };