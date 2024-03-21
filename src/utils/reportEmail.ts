import axios from 'axios';
import { error } from 'console';
export const reportEmail = async (pdfBase: string, email : string, fileName: string) => {
  try {
let data = JSON.stringify({
  "toEmail": email,
  "pdfBase64": pdfBase,
  "fileName": fileName,
  "subject":"Daily Log Report"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://logelddev.azurewebsites.net/api/ELDSubmission/SendReport',
  headers: { 
    'Authorization': 'Basic bG9nRUxEOmxvZ0VMRCExMjM0NSM=', 
    'Content-Type': 'application/json'
  },
  data : data
};

let response = await axios(config);
    return response;

  } catch (err) {
    return err;
  }
};
