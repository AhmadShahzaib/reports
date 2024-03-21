
export default interface IftaReportSubmissionRecordsDocument extends Document {
  
    reportType:string;
    Name:string;
    recipient:string,
    createdAt:string,
    pdf: string,
 csv: string;
 tenantId:string;
}
