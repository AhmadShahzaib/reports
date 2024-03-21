import moment from 'moment';

export const graphUpdatedData = async (graph): Promise<any> => {
  const TotalTimeInHHMM = {
    totalOffDutyTime: 0,
    totalSleeperBerthTime: 0,
    totalDrivingTime: 0,
    totalDutyTime: 0,
  };
  let updatedGraph = [];
  let statusesArray = [];

  if (graph) {
    statusesArray = graph.filter(function (el) {
      if (
        el?.status == 'ON DRIVING' ||
        el?.status == 'ON SB' ||
         el?.status == 'PC' ||
        el?.status == 'YM' ||
        el?.status == 'ON DUTY' ||
        el?.status == 'OFF DUTY' ||
        el?.actionType == 'OFF_DUTY'
      ) {
        return el;
      }
    });
    for (let item of graph) {
      if (item?.updated && item?.updated?.length > 0) {
        if (item?.updated[0].status === 'OFF DUTY' ||item?.updated[0].status ==='PC') {
          TotalTimeInHHMM.totalOffDutyTime +=
            item?.updated[0].totalSecondsSpentSoFar;
        }
        if (item?.updated[0].status === 'ON SB') {
          TotalTimeInHHMM.totalSleeperBerthTime +=
            item?.updated[0].totalSecondsSpentSoFar;
        }
        if (item?.updated[0].status === 'ON DRIVING') {
          TotalTimeInHHMM.totalDrivingTime +=
            item?.updated[0].totalSecondsSpentSoFar;
        }
        if (item?.updated[0].status === 'ON DUTY'||item?.updated[0].status === 'YM') {
          TotalTimeInHHMM.totalDutyTime +=
            item?.updated[0].totalSecondsSpentSoFar;
        }
        updatedGraph.push(item.updated[0]);
      } else {
        if (item?.status === 'OFF DUTY' || item?.status === 'PC') {
          TotalTimeInHHMM.totalOffDutyTime += item?.totalSecondsSpentSoFar;
        }
        if (item?.status === 'ON SB') {
          TotalTimeInHHMM.totalSleeperBerthTime += item?.totalSecondsSpentSoFar;
        }
        if (item?.status === 'ON DRIVING') {
          TotalTimeInHHMM.totalDrivingTime += item?.totalSecondsSpentSoFar;
        }
        if (item?.status === 'ON DUTY' || item?.status === 'YM') {
          TotalTimeInHHMM.totalDutyTime += item?.totalSecondsSpentSoFar;
        }
        updatedGraph.push(item);
      }
    }
  }

  return { TotalTimeInHHMM, updatedGraph, statusesArray };
};
