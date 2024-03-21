import axios from 'axios';
export const sendFmcsaEmail= async(outFileBody: string, investigationCode : string, fileName: string)=>{
    try {
        var data = JSON.stringify({
            "subject": "ELD ping from TEST:TESTXX",
            "body": investigationCode,
            "csvString": outFileBody,
            "fileName": fileName
          });
          
          
          var config = {
            method: 'post',
            url: 'https://logelddev.azurewebsites.net/api/ELDSubmission/PingSendEmail',
            headers: { 
              'Authorization': 'Basic bG9nRUxEOmxvZ0VMRCExMjM0NSM=', 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          let response= await axios(config)
    return response.data;
         
          
        } catch (error) {
            console.log(error);
            
    }
}
