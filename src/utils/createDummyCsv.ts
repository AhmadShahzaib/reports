import moment from 'moment';

export const dummyCsv = async (location:any , driverId:any,tenantId:any,companyTimeZone:any , vehicleId:any,checkDate:any) => {
    try {
        let index = 0
        let nawLog = {
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
            notes:'',
            eventRecordStatus:'',
            eventRecordOrigin:'',
            eventType:'',
          };


          let rawLog = JSON.parse(JSON.stringify(nawLog));
        rawLog.status ='offDuty'
        rawLog.actionType ='OFF_DUTY'
      
       
          rawLog.eventRecordOrigin = "AUTO"
       
    

        let startTime = moment(
          checkDate + "000000",
          'MMDDYYHHmmss',
        ).unix();
        
            
      
        let drv = {
          id: driverId,
          tenantId: tenantId,
          firstName:'Dummay',
          lastName: 'Dummay'
        };
        let addressOf=''
        if(location.hasOwnProperty('address')){
              addressOf=location.address
        }
        let loc= {
          longitude: location.longitude,
          latitude: location.latitude,
          
          address: addressOf,
        }
      rawLog.geoLocation = loc;
    
        rawLog.driver = drv;
       
        rawLog.totalSecondsSpentSoFar =0;
        
        rawLog.startedAt = startTime;
        
          rawLog.vehicleManualId =vehicleId
      
       
        rawLog.odoMeterMillage = 0
        // Number( statusLog.accumulatedVehicleMiles+'');
        // if(Number.isNaN(rawLog.odoMeterMillage)){
        //   rawLog.odoMeterMillage = 0
        // }
        rawLog.engineHours = 0
        // Number(statusLog.accumulatedEngineHours+'');
        // if(Number.isNaN(rawLog.engineHours)){
        //   rawLog.engineHours = 0
        // }
        rawLog.sequenceNumber = 1;
        
       
          rawLog.notes = 'Dummay Log'
       
        const currentDate = moment().format('MMDDYY').toString();

        
          if(currentDate!=checkDate){
           let last = moment(
              checkDate + "235900",
              'MMDDYYHHmmss',
            ).unix();
          rawLog.lastStartedAt = last
          rawLog.startedAt=moment(
            checkDate+ "000000",
            'MMDDYYHHmmss',
          ).unix();
           }
        else{
          const newtime = new Date();
          const options = {
            timeZone: companyTimeZone, // specify the time zone you want to get the date and time for
          
          };
          const nowinstring = newtime.toLocaleString('en-US',options)
          const now = new Date(Date.parse(nowinstring));
const hours = now.getHours().toString().padStart(2, "0");
const minutes = now.getMinutes().toString().padStart(2, "0");
const seconds = now.getSeconds().toString().padStart(2, "0");
const hhmmss = hours + minutes + seconds;
let last = moment(
  checkDate + hhmmss,
  'MMDDYYHHmmss',
).unix();
rawLog.lastStartedAt = last

        }
          return [rawLog];
  
    } catch (err) {
      return err;
    }
  };
  