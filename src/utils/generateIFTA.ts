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
import { Logger } from '@nestjs/common';

async function getTemplateHtml() {
  console.log('Loading template file in memory');
  try {
    console.log(fs.readFile);
    const readFile = util.promisify(fs.readFile);
    const templateFile = readFile('./ifta.html');
    return templateFile;
  } catch (err) {
    console.log(err);
    return Promise.reject('Could not load html template');
  }
}

export async function generateIFTA(
  formattedDate: string,
  startDate: string,
  endDate: string,
  companyName: string,
  address: string,
  phoneNo: string,
  completeData,
  fileName,
): Promise<Buffer> {
  const keys = Object.keys(completeData);
  const context = {
    startDate: startDate,

    endDate: endDate,
    companyName: companyName,
    address: address,
    phoneNo: phoneNo,
    vehicleHeading: 'All Vehicles ',
    date: formattedDate,
    vehicleName: 'dfsdfs',
    daa: completeData,
    fileName: fileName,
    keys,
  };

  let doc;

  return getTemplateHtml()
    .then(async (res) => {
      // Now we have the html code of our template in res object
      // you can check by logging it on console
      // console.log(res)
      // graphLinesData = graphLinesData.filter(function (element) {
      //   return element !== undefined;
      // });

      // if(sta)

      MomentHandler.registerHelpers(hb);
      hb.registerHelper('ifThird', function (index, options) {
        if (index % 2 == 0) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });
      hb.registerHelper('actionTime', function (index, options) {
        return moment.unix(index).format('HH:mm:ss A');
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
          `HH [hrs] mm [min] ss [sec]`,
        );
      });
      const template = hb.compile(res.toString(), { strict: true });

      // we have compile our code with handlebars
      // console.log(context);
      const result = template(context);
      // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
      const html = result;
      // we are using headless mode

      let browser ;
      try {
        browser = await puppeteer.launch();
      } catch (error) {
        Logger.log(error)
      }
      const page = await browser.newPage();
      // We set the page content as the generated html by handlebars
      await page.setContent(html);

      // We use pdf function to generate the pdf in the same folder as this file.
      const pdfConfig = {
        path: 'IFTA.pdf', // Saves pdf to disk.
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
