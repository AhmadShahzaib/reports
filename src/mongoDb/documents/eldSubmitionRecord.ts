
export default interface EldSubmitionRecordDocument extends Document {
  
    origin:string;
    eRODScode:string;
    driver:string;
    dateStart:string,
    dateEnd:string,
    status: string,
 createdTime: string;
    submissionID: string;
    errors:Array<any>;
    warnings: Array<any>;
    tenantId:string;
  
}
