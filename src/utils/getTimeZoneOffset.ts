import moment from 'moment';

export const getTimeZoneOffset = (companyTimeZone) => {
    var now = moment.utc().unix();
    let offset =  moment.tz.zone(companyTimeZone).utcOffset(now) / 60;
  
    // Asia/Thimbu Chile/Continental Africa/Asmera
    let result = ''
    if(offset < 0){
      offset = offset*(-1)
    }
  
      if(offset >= 11){
        offset=11
        result = '11'
      }
      else if(offset <= 4){
        offset=4
        result = '04'
      }
      else{
        result='0'+offset
  
      }
      
  
    return result
};