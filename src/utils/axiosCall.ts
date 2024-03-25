import axios from 'axios';
import { error } from 'console';
export const fmcsaCall = async (outFileBody: string, investigationCode : string, fileName: string) => {
  try {
    var data = JSON.stringify({
      eldIdentifier: 'TESTXX',
      eldRegistrationId: 'TEST',
      outputFileBody: outFileBody,
      outputFileComment: investigationCode,
      outputFilename: fileName,
      test: true,
      version: 1,
    });

    var config = {
      method: 'post',
      url: 'https://logelddev.azurewebsites.net/api/ELDSubmission/Post',
      headers: {
        Authorization: 'Basic bG9nRUxEOmxvZ0VMRCExMjM0NSM=',
        'Content-Type': 'application/json',
        Cookie:
          'ARRAffinity=78bae93df9e74321eb9dd0c64d1bd7b0af32c961324ee94567234e02204acb6a; ARRAffinitySameSite=78bae93df9e74321eb9dd0c64d1bd7b0af32c961324ee94567234e02204acb6a',
      },
      data: data,
    };

    let response = await axios(config);
    response.data.fileName = fileName;
    return response.data;
  } catch (err) {
    return err;
  }
};