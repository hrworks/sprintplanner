import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  private ses: SESClient | null = null;
  private fromEmail: string;
  private emailEnabled: boolean;

  constructor(private config: ConfigService) {
    const awsConfig: any = {
      region: config.get('AWS_REGION') || 'eu-central-1',
    };
    
    const accessKeyId = config.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get('AWS_SECRET_ACCESS_KEY');
    
    this.emailEnabled = !!(accessKeyId && secretAccessKey);
    
    if (this.emailEnabled) {
      awsConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
      this.ses = new SESClient(awsConfig);
    }
    
    this.fromEmail = config.get('SES_FROM_EMAIL') || 'noreply@example.com';
  }

  async sendInvite(to: string, boardName: string, inviterName: string, token: string) {
    if (!this.emailEnabled) {
      console.log(`[Mail] Email disabled - would send invite to ${to} for board ${boardName}`);
      return;
    }
    
    const baseUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    await this.ses!.send(new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: `Einladung: ${boardName}` },
        Body: {
          Html: {
            Data: `
              <p><strong>${inviterName}</strong> hat dich zum Board <strong>${boardName}</strong> eingeladen.</p>
              <p><a href="${inviteUrl}">Einladung annehmen</a></p>
            `,
          },
        },
      },
    }));
  }

  async sendUserInvite(to: string) {
    if (!this.emailEnabled) {
      console.log(`[Mail] Email disabled - would send user invite to ${to}`);
      return;
    }
    
    const baseUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    await this.ses!.send(new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: 'Einladung zu Sprint Planner' },
        Body: {
          Html: {
            Data: `
              <p>Du wurdest zu Sprint Planner eingeladen.</p>
              <p><a href="${baseUrl}">Jetzt anmelden</a></p>
            `,
          },
        },
      },
    }));
  }
}
