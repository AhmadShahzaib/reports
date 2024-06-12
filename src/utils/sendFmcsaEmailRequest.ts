import axios from 'axios';
export const sendFmcsaEmail= async(outFileBody: string, investigationCode : string, fileName: string)=>{
    try {
        const data = JSON.stringify({
            "subject": "ELD ping from TEST:TESTXX",
            "body": investigationCode,
            "csvString": outFileBody,
            "fileName": fileName
          });
          
          
          const config = {
            method: 'post',
            url: 'https://logelddev.azurewebsites.net/api/ELDSubmission/PingSendEmail',
            headers: { 
              'Authorization': 'Basic bG9nRUxEOmxvZ0VMRCExMjM0NSM=', 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          const response= await axios(config)
    return response.data;
         
          
        } catch (error) {
            console.log(error);
            
    }
}
