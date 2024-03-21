import axios from 'axios';

export const csvStandalone = async (
  unitData,
  decimalList,
  logForm,
  statusesData,
  eventLogInOut,
  eventPowerOnOff,
  current,
  investigationCode,
) => {
  try {
    var data = JSON.stringify({
      unitData: unitData,
      decimalList: decimalList,
      logForm: logForm,
      statusesData: statusesData,
      eventLogInOut: eventLogInOut,
      eventPowerOnOff: eventPowerOnOff,
      current: current,
      investigationCode: investigationCode,
    });

    var config = {
      method: 'post',
      url: 'http://localhost:2000/getStringCsv',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ7XCJpZFwiOlwiNjM1OTU0NTczNWQ1ZDA0ODcwOWIyOTAxXCIsXCJkcml2ZXJJZFwiOlwiRDFcIixcInVzZXJOYW1lXCI6XCJkcml2ZXIxXCIsXCJlbWFpbFwiOlwiZEBkLmNvbVwiLFwiZmlyc3ROYW1lXCI6XCJEcml2ZXJcIixcImxhc3ROYW1lXCI6XCJPbmVcIixcImhvbWVUZXJtaW5hbEFkZHJlc3NcIjpcIjYzMjQ5Mjc3OWQ0YjFmNDE5ZDA1YzEyZFwiLFwic3RhdGVcIjpcIkFsYWJhbWFcIixcImhvbWVUZXJtaW5hbFRpbWVab25lXCI6e1widHpDb2RlXCI6XCJQYWNpZmljL01pZHdheVwiLFwidXRjXCI6XCItMTE6MDBcIixcImxhYmVsXCI6XCJQYWNpZmljL01pZHdheSAoR01ULTExOjAwKVwiLFwibmFtZVwiOlwiKEdNVC0xMTowMCkgTWlkd2F5XCJ9LFwidmVoaWNsZUlkXCI6XCI2MzU5NTQ0OTgwOWE4ODljNWRmMTliZDFcIixcImNvRHJpdmVyXCI6bnVsbCxcImVuYWJsZUVsZFwiOmZhbHNlLFwiZW5hYmxlRWxvZ1wiOmZhbHNlLFwieWFyZE1vdmVcIjpmYWxzZSxcImFzc2lnblRvXCI6bnVsbCxcInRlbmFudElkXCI6XCI2MzI0NGRmNzhiYjNjNGM2YzYxZTU3NjdcIixcImN5Y2xlUnVsZVwiOlwiVVNBIFByb3BlcnR5IDcwIEhvdXIgLyA4IERheVwiLFwiaXNEcml2ZXJcIjp0cnVlLFwiY29tcGFueVRpbWVab25lXCI6XCJBc2lhL0thcmFjaGlcIixcImxpY2Vuc2VQbGF0ZU5vXCI6XCJMMTExMVwifSIsImlhdCI6MTY3Mjk4OTQ3OCwiZXhwIjoxNjczMDc1ODc4LCJqdGkiOiIzY2VkN2ExZS01NjhmLTRiYmQtYTcxOS1hNTFmOWE2NDE3ZDYifQ.S1896qM7LR8Yo6CgpF0hTTZOAsHtq2J-nZT8LFNgs9g',
      },
      data: data,
    };

    let response = await axios(config);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
