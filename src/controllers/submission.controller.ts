import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, UseFilters, UsePipes } from '@nestjs/common';
import { AppService } from '../services/app.service';



import { SendEmailRequestDto, SendReportRequestDto, ELDSubmissionDto, SendCustomEmailRequestDto } from './dto';
import * as nodemailer from 'nodemailer';
import { ELDSubmissionServiceClient } from './eld-submission-service-client';
import * as fs from 'fs';
import * as path from 'path';
import { X509Certificate } from 'crypto';

@Controller('api/ELDSubmission')
export class ELDSubmissionController {
  private readonly testThumbPrint = 'ae35f47072152461f548ba7fa52aad92fc7956e2';
  private readonly productionThumbPrint = 'bc21ed5c8e9d703819c59d2ec758f070220a6a3d';

  constructor(
    private readonly appService: AppService
  ) {}


  @Post('Post')
  @UseFilters()
  async post(@Body() submission: ELDSubmissionDto) {
    try {
      const serviceClient = this.getWsHttpClient(submission.test);
      const request = { data: submission };
      const submitResponse = await serviceClient.submit(request);
      await serviceClient.close();
      await this.sendWebServiceResponseEmail(submitResponse.SubmitResult, submission);
      return { statusCode: 200, data: submitResponse.SubmitResult };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('Ping')
  @UseFilters()
  async ping(@Query('test') test: boolean, @Query('eldIdentifier') eldIdentifier: string, @Query('eldRegistrationId') eldRegistrationId: string) {
    try {
      const serviceClient = this.getWsHttpClient(test);
      const pingRequest = { data: { ELDRegistrationId: eldRegistrationId, ELDIdentifier: eldIdentifier } };
      const pingResponse = await serviceClient.ping(pingRequest);
      await serviceClient.close();
      return { statusCode: 200, data: pingResponse.PingResult };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('SendEmail')
  @UseFilters()
  @UsePipes( )
  async sendEmail(@Body() sendEmailRequest: SendEmailRequestDto) {
    try {
      const encryptionCertificate = this.getEncryptionCertFromFile(sendEmailRequest.test);
      const signingCertificate = this.getSigningCertFromFile(sendEmailRequest.test);

      const transporter = nodemailer.createTransport({
        host: 'your_smtp_host',
        port: 587,
        secure: false,
        auth: {
          user: 'your_smtp_username',
          pass: 'your_smtp_password',
        },
      });

      const message = {
        from: 'from@example.com',
        to: 'to@example.com',
        subject: sendEmailRequest.subject,
        text: sendEmailRequest.body,
        attachments: [
          {
            filename: sendEmailRequest.fileName,
            content: Buffer.from(sendEmailRequest.csvString, 'utf-8'),
          },
        ],
      };

      const info = await transporter.sendMail(message);
      return { statusCode: 200, message: 'Email sent successfully', info };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('PingSendEmail')
  @UseFilters()
  @UsePipes( )
  async pingSendEmail(@Body() sendEmailRequest: SendEmailRequestDto) {
    return this.sendEmail(sendEmailRequest);
  }

  @Post('SendReport')
  @UseFilters()
  @UsePipes( )
  async sendReport(@Body() sendReportRequest: SendReportRequestDto) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'your_smtp_host',
        port: 587,
        secure: false,
        auth: {
          user: 'your_smtp_username',
          pass: 'your_smtp_password',
        },
      });

      const message = {
        from: 'from@example.com',
        to: sendReportRequest.toEmail,
        subject: sendReportRequest.subject || 'Log Report',
        text: 'Please find the attached pdf file containing logs',
        attachments: [
          {
            filename: `${sendReportRequest.fileName}.pdf`,
            content: Buffer.from(sendReportRequest.pdfBase64, 'base64'),
          },
        ],
      };

      const info = await transporter.sendMail(message);
      return { statusCode: 200, message: 'Report sent successfully', info };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('SendCustomEmail')
  @UseFilters()
  @UsePipes()
  async sendCustomEmail(@Body() sendCustomEmailRequest: SendCustomEmailRequestDto) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'your_smtp_host',
        port: 587,
        secure: false,
        auth: {
          user: 'your_smtp_username',
          pass: 'your_smtp_password',
        },
      });

      const message = {
        from: 'from@example.com',
        to: sendCustomEmailRequest.toEmails,
        cc: sendCustomEmailRequest.ccEmails,
        bcc: sendCustomEmailRequest.bccEmails,
        subject: sendCustomEmailRequest.subject,
        html: sendCustomEmailRequest.body,
      };

      const info = await transporter.sendMail(message);
      return { statusCode: 200, message: 'Email sent successfully', info };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getWsHttpClient(test: boolean): ELDSubmissionServiceClient {
    const certThumbPrint = test ? this.testThumbPrint : this.productionThumbPrint;
    return new ELDSubmissionServiceClient(certThumbPrint);
  }

  private getEncryptionCertFromFile(test: boolean): X509Certificate {
    const certificatePath = test
      ? path.join(__dirname, '..', 'certificates', 'sandbox', 'FMCSA_ELD_Expires_July2024_Certificate.cer')
      : path.join(__dirname, '..', 'certificates', 'production', 'FMCSA_ELD_Expires_July2024_Certificate.cer');
    return new X509Certificate(fs.readFileSync(certificatePath));
  }

  private getSigningCertFromFile(test: boolean): X509Certificate {
    const certificatePath = test
      ? path.join(__dirname, '..', 'certificates', 'sandbox', 'ELD_RSA.pfx')
      : path.join(__dirname, '..', 'certificates', 'production', 'LogELDPFX.pfx');
    return new X509Certificate(fs.readFileSync(certificatePath));
  }

  private async sendWebServiceResponseEmail(response: any, submission: any): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'your_smtp_host',
      port: 587,
      secure: false,
      auth: {
        user: 'your_smtp_username',
        pass: 'your_smtp_password',
      },
    });

    const message = {
      from: 'from@example.com',
      to: 'log@example.com',
      subject: `FMCSA WebService Response SubmissionId:${response.SubmissionId}`,
      text: JSON.stringify({ Client: this.getClientIP(), Submission: submission, Response: response }, null, 2),
      attachments: [
        {
          filename: `${submission.OutputFilename}.csv`,
          content: Buffer.from(submission.OutputFileBody, 'utf-8'),
        },
        {
          filename: `${response.SubmissionId}.json`,
          content: Buffer.from(JSON.stringify(response, null, 2), 'utf-8'),
        },
      ],
    };

    await transporter.sendMail(message);
  }

  private getClientIP(): string {
    // Implement method to retrieve client IP
    return '';
  }
}
