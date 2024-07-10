import * as fs from 'fs';
import * as util from 'util';
import * as puppeteer from 'puppeteer';
import * as hb from 'handlebars';
import * as MomentHandler from 'handlebars.moment';
import moment from 'moment';
import { GraphType } from './garphType';
import { InspectionResponse } from '../models/inspectionresponseModel';
import { min } from 'lodash';
import { getDriverSign } from './getSignPath';
import { from } from 'rxjs';
import { getLogsFormData } from './getlogsFormData';

const getRectOrderNumberWRTStatus = (status: string) => {
  let row = 0;
  if (status === 'OFF DUTY' || status === 'PC') {
    row = 1;
  } else if (status === 'ON SB') {
    row = 2;
  } else if (status === 'ON DRIVING') {
    row = 3;
  } else if (status === 'ON DUTY' || status === 'YM') {
    row = 4;
  }
  return row;
};

const getLnStartingPoint = (status: string) => {
  const sectionHeight = 40;

  return sectionHeight * getRectOrderNumberWRTStatus(status);
};
export const convertUnixCompanyTimeZone = (
  unixValue: number,
  companyTimeZone,
) => {
  const dateFromUnix = moment.unix(unixValue);

  // dateFromUnix.minutes(new Date().getTimezoneOffset())
  return dateFromUnix;
};

const convertUnixToMinutes = (unix: number, companyTimeZone) => {
  const dateFromUnix = convertUnixCompanyTimeZone(unix, companyTimeZone);
  const minutesFromHours = dateFromUnix.hours() * 60;

  // console.log(`converted: ${minutesFromHours + dateFromUnix.minutes()}`);
  // console.log(dateFromUnix.minutes());

  return minutesFromHours + dateFromUnix.minutes();
};

type LineCoordinates = { x1: number; x2: number; y1: number; y2: number };
type GraphLineType = {
  horizLn: LineCoordinates;
  vertLn?: LineCoordinates;
};

const slightlyBiggerLineHeight = 15;

const transformDataForGraphLines = (
  graphData: GraphType,
  index: number,
  completeData: GraphType[],
  companyTimeZone,
): GraphLineType => {
  const status = graphData.status;
  if (
    status == 'LOGIN' ||
    status == 'LOGOUT' ||
    status == 'EV_ENGINE_OFF' ||
    status == 'EV_ENGINE_ON' ||
    status == 'INT' ||
    status == 'Certification'
  ) {
    const result = {
      horizLn: {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
      },
    };

    // no further status, so do not draw a vertical line afterwards

    Object.assign(result, {
      vertLn: {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
      },
    });

    return result;
  } else {
    const horizontalLineBottomMargin = 7;
    if (index < completeData.length - 1) {
      if (!completeData[index + 1].startedAt) {
        index++;
      }
    }
    if (graphData.startedAt) {
      // horizontal line
      const x1 = convertUnixToMinutes(graphData.startedAt, companyTimeZone);

      const x2 = convertUnixToMinutes(graphData.lastStartedAt, companyTimeZone);

      const y1 =
        getLnStartingPoint(graphData.status) -
        slightlyBiggerLineHeight -
        horizontalLineBottomMargin;

      const y2 =
        getLnStartingPoint(graphData.status) -
        slightlyBiggerLineHeight -
        horizontalLineBottomMargin;

      let vy1 = 0;
      // check the order of next status and decide the starting point of vertical line that connects with another status
      if (completeData?.length > index + 1) {
        vy1 = getLnStartingPoint(completeData[index + 1].status) - 22;
      }

      const result = {
        horizLn: {
          x1,
          x2,
          y1,
          y2,
        },
      };

      // no further status, so do not draw a vertical line afterwards
      if (vy1 > 0) {
        Object.assign(result, {
          vertLn: {
            x1: x2,
            x2,
            y1: vy1,
            y2,
          },
        });
      }

      return result;
    }
  }
};
function convertHM(value) {
  // Hours, minutes and seconds
  let ret = '';
  if (value) {
    const hrs = value / 3600;
    const mins = (value % 3600) / 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    if (hrs > 0) {
      ret +=
        '' + (hrs < 10 ? '0' + Math.floor(hrs) : '' + Math.floor(hrs)) + ':';
    } else {
      ret += '00:';
    }
    if (mins > 0) {
      ret += mins < 10 ? '0' + Math.floor(mins) : '' + Math.floor(mins);
    } else {
      ret += '00';
    }
  } else {
    ret = '00:00';
  }

  return ret;
}

async function getTemplateHtml() {
  console.log('Loading template file in memory');
  try {
    console.log(fs.readFile);
    const readFile = util.promisify(fs.readFile);
    const templateFile = readFile('./reports.html');
    return templateFile;
  } catch (err) {
    console.log(err);
    return Promise.reject('Could not load html template');
  }
}

export async function generatePdf(
  graphData: GraphType[],
  recap: any,
  inspection: InspectionResponse[],
  driverData: any,
  TotalTimeInHHMM,
  date: string,
  serviceSign,
  id: string,
  companyTimeZone: string,
  awsService,
  tripInspectionService,
  objectData,
  totalTime,
  unidentifiedIndicator,
  dataDignosticIndicator,
  malfunctionIndicator,
  totalMielsTrevled,
  // isDummy
): Promise<Buffer> {
  const defect: boolean = false;
  const notDefect: boolean = true;
  const reverseable = 8;
  const object = {};
  const recaps = Object.keys(recap);
  const currentDate = recap.date;
  for (let i = 0; i < objectData.length; i++) {
    object[i] = objectData[i];
  }

  // object[`${reverseable}`] = convertHM(TotalTimeInHHMM.totalDrivingTime+TotalTimeInHHMM.totalDutyTime);

  if (inspection && inspection.length > 0) {
    for (const key of inspection) {
      key['driver'] = driverData ?? {};
      const vehicleDefect = key?.defectsCategory?.vehicle.filter(
        (item) => item.resolved === false,
      );
      const trailerDefect = key?.defectsCategory?.trailer.filter(
        (item) => item.resolved === false,
      );
      if (vehicleDefect || trailerDefect) {
        key['defect'] = true;
        key['notDefect'] = false;
      } else {
        key['defect'] = false;
        key['notDefect'] = true;
      }
    }
  }

  let logsForm = {};
  const data = await getLogsFormData(
    date,
    id,
    tripInspectionService,
    serviceSign,
    awsService,
    driverData.tenantId,
    companyTimeZone,
  );
  let shippingID_String = '';
  let trailerNumber_String = '';
  if (data) {
    logsForm = data.logForm;
    shippingID_String = logsForm['shippingDocument'].toString();
    trailerNumber_String = logsForm['trailerNumber'].toString();
  }
  const formData = logsForm;
  let imagePath = '';
  if (formData && formData['sign']) {
    let sign = formData['sign'];
    if (sign.imagePath) {
      imagePath = sign.imagePath;
    }
  }
  const logDate = moment(date, 'YYYY-MM-DD').unix();
  const graphEvent = graphData;
  driverData.carrier = formData['carrier']

  // .filter(function (element) {
  //   return (
  //     !element.eventType &&
  //     element.actionType !== 'LOGIN' &&
  //     element.actionType !== 'LOGOUT'
  //   );
  // });
  // console.log("\n/n"+( (clockData.cycleSeconds+( clockData.cycleSeconds -(TotalTimeInHHMM.totalDrivingTime+TotalTimeInHHMM.totalDutyTime)))));
  // let diffrance =  ( clockData.cycleSeconds -(TotalTimeInHHMM.totalDrivingTime+TotalTimeInHHMM.totalDutyTime))
  // if(diffrance<0){
  //  diffrance= (clockData.cycleSeconds + (-1*( clockData.cycleSeconds -(TotalTimeInHHMM.totalDrivingTime+TotalTimeInHHMM.totalDutyTime))))

  // }
  // else{

  // }
  let startEngine;
  let startOdometer;
  let endOdometer;
  let endEngine;

  // const firstPowerEvent =await start_odometer_engin(graphEvent);
  // async function start_odometer_engin(graphEvent){
  //   graphEvent.map((element,index)=>{
  //     if(element.actionType == 'EV_ENGINE_ON'){
  //       startEngine = element.engineHours;
  //       startOdometer = element.odoMeterMillage
  //       return element
  //     }
  //   })
  // }
  let totalHoursToday =
    TotalTimeInHHMM.totalDrivingTime + TotalTimeInHHMM.totalDutyTime;
  totalHoursToday = convertHM(totalHoursToday);

  console.log('\n\n\n\n Total Time Is : ' + totalTime);
  // if (totalTime<=0) {
  //   totalTime = (252000 -(TotalTimeInHHMM.totalDrivingTime+TotalTimeInHHMM.totalDutyTime))
  // }
  // else{
  //   totalTime =252000 -  totalTime
  // }

  const milageGraph = JSON.parse(JSON.stringify(graphEvent));
  milageGraph.sort((a, b) => a.startedAt - b.startedAt);
  // if (milageGraph[0].eventType == 'LOGIN') {
  //   startEngine = milageGraph[1]?.engineHours;
  //   startOdometer = graphData[1]?.odoMeterMillage;
  // } else {
  startEngine = milageGraph[0]?.engineHours;
  startOdometer = milageGraph[0]?.odoMeterMillage;
  // }
  endEngine = milageGraph[milageGraph.length - 1]?.engineHours;
  endOdometer = milageGraph[milageGraph.length - 1]?.odoMeterMillage;

  const context = {
    driver: driverData,
    currentDate: currentDate,
    odometerStart: startOdometer,
    odometerEnd: endOdometer,
    engineStart: startEngine,
    hoursWorkAvailable: convertHM(totalTime),
    // shippingDocument: shippingID_String,
    // trailerNumber: trailerNumber_String,
    distance: totalMielsTrevled,
    // graphEvent.length > 1
    //   ? graphEvent[graphEvent.length - 1]?.odoMeterMillage -
    //     graphEvent[0]?.odoMeterMillage
    //   : graphEvent[0]?.odoMeterMillage,
    from: '',
    to: '',
    logSign: imagePath ?? '',
    companyTimeZone: companyTimeZone,
    totalHoursToday: totalHoursToday,
    engineEnd: endEngine,
    inspectionDate: moment(moment.unix(logDate)).format(`MMMM D YYYY`),

    currentInspectiondate: moment.unix(logDate),
    totalOffDutyTime: convertHM(TotalTimeInHHMM.totalOffDutyTime),
    drivingTime: convertHM(TotalTimeInHHMM.totalDrivingTime),
    dutyTime: convertHM(TotalTimeInHHMM.totalDutyTime),
    sleeperTime: convertHM(TotalTimeInHHMM.totalSleeperBerthTime),
    backData: object,
    defect: defect,
    notDefect: notDefect,
    spacing: 59.5,
    counter: 0,
    // driverSign: null,
    // mechanicSign: null,
    inspection: inspection,
    data: graphData,
    // isDummy:isDummy,
    unidentifiedIndicator: unidentifiedIndicator,
    malfunctionIndicator: malfunctionIndicator,
    dataDignosticIndicator: dataDignosticIndicator,
    topLabels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      'N',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      'M',
    ],
  };
  const largeVerticalLines = [];
  for (let i = 1; i <= 23; i++) {
    largeVerticalLines.push(60 * i);
  }
  const smallVerticalsLines = [];
  for (let a = 1; a <= 24 * 4; a++) {
    smallVerticalsLines.push(15 * a);
  }
  let doc;

  return getTemplateHtml()
    .then(async (res) => {
      // Now we have the html code of our template in res object
      // you can check by logging it on console
      // console.log(res)

      const graphLinesData = graphEvent?.map(
        (item, index, completeData: GraphType[]) =>
          transformDataForGraphLines(
            item,
            index,
            completeData,
            companyTimeZone,
          ),
      );
      // graphLinesData = graphLinesData.filter(function (element) {
      //   return element !== undefined;
      // });
      Object.assign(context, {
        graph: graphLinesData,
        currentSpace: largeVerticalLines,
        smallVerticalsLines: smallVerticalsLines,
      });
      let count = 0;
      const sortedGraph = graphEvent.sort((a, b) => a.startedAt - b.startedAt);

      // if(sta)
      hb.registerHelper('increment', function () {
        return ++count * 59.9;
      });
      hb.registerHelper('incSerialNo', function (index) {
        return index + 1;
      });
      hb.registerHelper('event', function (index) {
        if (index === 'EV_ENGINE_OFF') {
          return 'Engine Shut-Down';
        }
        if (index === 'EV_ENGINE_ON') {
          return 'Engine Power-Up';
        }
        if (index === 'LOGIN') {
          return 'Login';
        }
        if (index === 'LOGOUT') {
          return 'Logout';
        }
      });

      MomentHandler.registerHelpers(hb);
      hb.registerHelper('ifThird', function (index, options) {
        if (index % 2 == 0) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });
      hb.registerHelper('actionTime', function (index, options) {
        const ans = moment.unix(index).format('hh:mm:ss A');
        return ans;
      });
      hb.registerHelper('workHours', function (value, options) {
        const time = value.split(':');
        let ret = '';
        if (time[0].trim() > 0) {
          const hrs = Math.floor(70 - time[0].trim());
          hrs < 10 ? (ret += '0' + hrs + ':') : (ret += hrs + ':');
        } else {
          ret += '00:';
        }
        if (time[1].trim() > 0) {
          const mins = Math.floor(60 - time[1].trim());
          mins < 10 ? (ret += '0' + mins) : (ret += mins);
        } else {
          ret += '00';
        }
        return ret;
      });

      hb.registerHelper('actionType', function (rec) {
        if (!(rec.status == 'LOGIN' || rec.status == 'LOGOUT')) {
          return rec.status;
        }
        return rec.status;
      });
      hb.registerHelper('difference', function (last, start) {
        return moment(moment.utc((last - start) * 1000)).format(
          `HH [hrs] mm [min] `,
        );
      });
      const template = hb.compile(res.toString(), { strict: true });

      // we have compile our code with handlebars
      // console.log(context);
      let result;
      context.driver.eldNo = 'asd';
    
      try {
        result = template(context);
      } catch (error) {
        console.error(error);
      }
      // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
      const html = result;
      // we are using headless mode

      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      // We set the page content as the generated html by handlebars
      await page.setContent(html);

      // We use pdf function to generate the pdf in the same folder as this file.
      const pdfConfig = {
        path: 'reports.pdf', // Saves pdf to disk.
        // format: 'A4',
        printBackground: true,
        margin: {
          // Word's default A4 margins
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm',
        },
        displayHeaderFooter: true,
        headerTemplate: '<></>',
        footerTemplate: `
        footerTemplate: "<div style=\"text-align: right;width: 297mm;font-size: 8px;\"><span style=\"margin-right: 1cm\"><span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span></div>`,
      };
      doc = await page.pdf(pdfConfig);
      await browser.close();
      return doc;
    })
    .catch((err) => {
      console.error(err);
    });
}
