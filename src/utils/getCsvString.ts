import {getTimeZoneDateRangeForDay,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

import mongoose, { FilterQuery } from 'mongoose';

import { getArrayData } from 'utils/getArrayData';

export const getCsvString =async(tripInspectionService,serviceSign, driverId, dateStart,dateEnd,companyTimeZone, investigationCode )=>{
    try {
        // const { start: startOfDay } = getTimeZoneDateRangeForDay(
        //     dateStart,
        //     companyTimeZone,
        //   );
        //   const { end: endOfDay } = getTimeZoneDateRangeForDay(
        //     dateEnd,
        //     companyTimeZone,
        //   );
          // let options: FilterQuery<LogsDocument> = {
          //      "driver.id": new mongoose.Types.ObjectId(driverId),
          // };
        // let unitData = await tripInspectionService.getUnitData(driverId);

      
        // let graph = await tripInspectionService.getGraphDataOnRange(driverId,startOfDay, endOfDay, false, true);
        // var decimal = 0;
       
       
        // const logForm =         await serviceSign.findLogForm(
        //   driverId,
        //   dateEnd,
        //   companyTimeZone,
        // );
      //   if (graph.length<=  0){
      //     return {
      //       resultString:"",
      //     unitData: {},
      // current: {},error: { message: "No Logs available for this date"}
            
      //     }
      //   }
        // let statusesData = graph?.filter(
        //   (el) =>
        //     el.actionType != 'LOGIN' &&
        //     el.actionType != 'LOGOUT' &&
        //     !el.eventType,
        // );
      //  let eventAnnotationComments = graph?.filter((item)=>{ item.updated.length !< 0 && item.updated.length > 0})
      
        // let eventLogInOut = graph?.filter(
        //   (el) =>
        //     el.actionType != 'OFF_DUTY' &&
        //     el.actionType != 'ON_DUTY_NOT_DRIVING' &&
        //     el.actionType != 'SLEEPER_BERTH' &&
        //     el.actionType != 'DRIVING' &&
           
        //     !el.eventType,
        // );
        // let eventPowerOnOff = graph?.filter(
        //   (el) =>
        //     el.eventType == 'EV_ENGINE_ON' ||
        //     el.eventType == 'EV_ENGINE_OFF'
           
           
           
        // );
      //   if ( graph.statusesData<=  0 ){
      //     return {
      //       resultString:"",
      //     unitData: {},
      // current: {},error: { message: "No Event log available, Please generate event logs such as on driving, ON_duty etc"}
            
      //     }
      //   }
        // let updatedDataGraph = await graphUpdatedData(statusesData);
        // let current: any = {};
        // if (statusesData.length > 0) {
        //   current = statusesData[statusesData.length - 1];
        // }
        // const dataArrays = "gfcghchg"
        // getArrayData(unitData,startOfDay,companyTimeZone, decimal, logForm, statusesData,eventLogInOut,eventPowerOnOff, current, investigationCode);

        // let resultString = [''];
        // for (let line of dataArrays) {
        //   resultString[0] += line + '\r';
        // }
    //     return { resultString:resultString,
    //     unitData: unitData,
    // current: current,error: null };
    return "this package is no more in use"
    } catch (error) {
        return { resultString:"",
          unitData: {},
      current: {},error: error };
    }
}