import { Container, Service } from 'typedi';
import { MailerInterface, MailerItem } from '../core/mailer_interface';
import sendgrid from '@sendgrid/mail';
import { logger } from '../core/logger';

const config = Container.get('config') as any;
sendgrid.setApiKey(config.sendgrid.apikey);

@Service('mailer')
export class SendgridMailerService implements MailerInterface {
    public async send(item: MailerItem): Promise<void> {
        const msg = {
            from: item.from,
            to: item.to,
            cc: item.cc,
            bcc: item.bcc,
            subject: item.subject,
            html: item.message
        };

        try {
            await sendgrid.send(msg);

            logger.info(`Successfully sent an email`, {
                area: 'services',
                subarea: 'mailer:sendgrid',
                action: 'send-email',
                result: 'success',
                msg
            });
        } catch (error) {
            logger.error(`Failed to send an email`, {
                area: 'services',
                subarea: 'mailer:sendgrid',
                action: 'send-email',
                result: 'failed',
                msg,
                error
            });

            throw new Error(`Failed to send email: ${error.message} ${error.stack}`);
        }
    }
}
