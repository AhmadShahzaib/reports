import moment from "moment"
export const dateFormat=(date :number, companyTimeZone)=>{
   return moment.tz(moment.unix(date), companyTimeZone).format('MMDDYY');
}
export const timeFormat=(date :number, companyTimeZone)=>{
 
    return  moment.tz(moment.unix(date), companyTimeZone).format('HHmmss');
   
 }