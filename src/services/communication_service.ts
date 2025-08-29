import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { MailerInterface } from '../core/mailer_interface';
import { PublicStoreConfig } from '../database/entities/public_store_config';
import { getFixedT } from '../loaders/i18next';
import HtmlService from '../services/html_service';
import { InviteDescriptor } from '../types/invite_descriptor';
import { ResetPasswordDescriptor } from '../types/reset_password_descriptor';
import { ensureTrailingSlash } from '../utils/ensure_trailing_slash';
import { CssColorContext } from '@pictaccio/shared/types/css_color_context';
import {
    CssStyleDescription,
    CssStyleInternal,
    CssStyleTransactional
} from '@pictaccio/shared/types/css_color_descriptor';
import { OrderDescriptor } from '@pictaccio/shared/types/order_descriptor';
import { join } from 'path';
import { Inject, Service } from 'typedi';

@Service('communication')
export default class CommunicationService {
    constructor(@Inject('mailer') private mailer: MailerInterface,
        @Inject('config') private config: ConfigSchema,
        @Inject('html') private htmlService: HtmlService) {
    }

    public async sendInvite(inviteDescriptor: InviteDescriptor): Promise<void> {
        const t = await getFixedT(inviteDescriptor.lang);
        const storeName = await PublicStoreConfig.get('store-name');
        const data = {
            headerText: t('mail:inviteUser.header', {
                inviter: inviteDescriptor.inviterName,
                store: storeName ?? t('common:Pictaccio')
            }),
            expirationDelayInH: this.config.app.db.codeExpiryTimeInHour,
            inviteLink: inviteDescriptor.inviteLink,
            footerText: '',
            storeLocation: await this._storeAddress(),
            reasonOrUnsubscribe: t('mail:inviteUser.footer.reasonOrUnsubscribe', {
                store: storeName
            })
        };
        const template = await this.htmlService.render(
            join(this.config.http.servers.web.dirs.templates, 'mails/inviteUser.handlebars'),
            data,
            {
                lang: inviteDescriptor.lang,
                layout: join(this.config.http.servers.web.dirs.templates, 'layouts/email.handlebars'),
                title: 'email'
            });

        try {
            await this.mailer.send({
                from: this.config.app.email.from,
                to: inviteDescriptor.inviteeEmail,
                subject: t('mail:inviteUser.subject', { store: storeName }),
                message: template
            });
        } catch (error) {
            logger.error(`Error while sending invite email to ${inviteDescriptor.inviteeEmail}`, {
                area: 'service',
                subarea: 'communication',
                action: 'send:invite',
                recipient: inviteDescriptor.inviteeEmail,
                error
            });
        }
    }

    public async sendOrderPublishCustomerNotification(order: OrderDescriptor, downloadToken: string): Promise<void> {
        const t = await getFixedT(order.language);
        const storeName = await PublicStoreConfig.get('store-name');
        const data = {
            _cssContext: await this._cssStyleContext('transactional'),
            hideHeader: true,
            headerText: t('mail:orderPublishCustomerNotification.header', { store: storeName }),
            orderId: order.id,
            footerText: '',
            storeLocation: await this._storeAddress(),
            downloadLink: ensureTrailingSlash(this.config.env.rootUrl.transactional) + 'bits/' + downloadToken,
            reasonOrUnsubscribe: t('mail:orderPublishCustomerNotification.footer.reasonOrUnsubscribe', {
                store: storeName
            })
        };
        const template = await this.htmlService.render(
            join(this.config.http.servers.web.dirs.templates, 'mails/orderPublishCustomerNotification.handlebars'),
            data, {
            lang: order.language,
            layout: join(this.config.http.servers.web.dirs.templates, 'layouts/email.handlebars'),
            title: 'email'
        });

        try {
            await this.mailer.send({
                from: this.config.app.email.from,
                to: order.contact.email,
                subject: t('mail:orderPublishCustomerNotification.subject', { store: storeName }),
                message: template
            });
        } catch (error) {
            logger.error(`Error sending order publish customer notification to ${order.contact.email}`, {
                area: 'service',
                subarea: 'communication',
                action: 'send:orderPublishCustomerNotification',
                recipient: order.contact.email,
                error
            });
        }
    }

    public async sendResetPassword(resetPasswordDescriptor: ResetPasswordDescriptor): Promise<void> {
        const t = await getFixedT(resetPasswordDescriptor.lang);
        const storeName = await PublicStoreConfig.get('store-name');
        const data = {
            headerText: t('mail:resetPassword.header'),
            resetCode: resetPasswordDescriptor.resetCode,
            footerText: '',
            storeLocation: await this._storeAddress(),
            reasonOrUnsubscribe: t('mail:resetPassword.footer.reasonOrUnsubscribe', {
                store: storeName
            })
        };
        const template = await this.htmlService.render(
            join(this.config.http.servers.web.dirs.templates, 'mails/resetPassword.handlebars'),
            data,
            {
                lang: resetPasswordDescriptor.lang,
                layout: join(this.config.http.servers.web.dirs.templates, 'layouts/email.handlebars'),
                title: 'email'
            });

        try {
            await this.mailer.send({
                from: this.config.app.email.from,
                to: resetPasswordDescriptor.userEmail,
                subject: t('mail:resetPassword.subject', { store: storeName }),
                message: template
            });
        } catch (error) {
            logger.error(`Error sending password reset to ${resetPasswordDescriptor.userEmail}`, {
                area: 'service',
                subarea: 'communication',
                action: 'send:orderPublishCustomerNotification',
                recipient: resetPasswordDescriptor.userEmail,
                error
            });
        }
    }

    /* PRIVATE */
    private async _cssStyleContext(context: CssColorContext): Promise<CssStyleDescription> {
        let accent: string,
            background1: string,
            background2: string,
            background3: string,
            importantBackground1: string,
            importantBackground2: string,
            borderRadius: string,
            boxShadow: string
            ;
        const brandingColors = JSON.parse(await PublicStoreConfig.get('branding-colors'));

        switch (context) {
            case 'transactional':
                accent = brandingColors?.accent ?? CssStyleTransactional.accent;
                background1 = brandingColors?.background1 ?? CssStyleTransactional.background1;
                background2 = brandingColors?.background2 ?? CssStyleTransactional.background2;
                background3 = brandingColors?.background3 ?? CssStyleTransactional.background3;
                importantBackground1 = brandingColors?.background1 ?? CssStyleTransactional.importantBackground1;
                importantBackground2 = brandingColors?.importantBackground2 ?? CssStyleTransactional.importantBackground2;
                borderRadius = brandingColors?.borderRadius ?? CssStyleTransactional.borderRadius;
                boxShadow = brandingColors?.boxShadow ?? CssStyleTransactional.boxShadow;
                break;
            case 'internal':
                accent = CssStyleInternal.accent;
                background1 = CssStyleInternal.background1;
                background2 = CssStyleInternal.background2;
                background3 = CssStyleInternal.background3;
                importantBackground1 = CssStyleInternal.importantBackground1;
                importantBackground2 = CssStyleInternal.importantBackground2;
                borderRadius = CssStyleInternal.borderRadius;
                boxShadow = CssStyleInternal.boxShadow;
                break;
            default:
                throw new Error(`Unknown context: ${context}`);
        }

        return {
            accent,
            background1,
            background2,
            background3,
            importantBackground1,
            importantBackground2,
            borderRadius,
            boxShadow
        };
    }

    private async _storeAddress(): Promise<string> {
        const addressLine1 = await PublicStoreConfig.get('store-address-address-line1');
        const addressLine2 = await PublicStoreConfig.get('store-address-address-line2');
        const unitType = await PublicStoreConfig.get('store-address-unit-type');
        const unitNumber = await PublicStoreConfig.get('store-address-unit-number');
        const city = await PublicStoreConfig.get('store-address-city');
        const province = await PublicStoreConfig.get('store-address-region');
        const country = await PublicStoreConfig.get('store-address-country');
        const postalCode = await PublicStoreConfig.get('store-address-postal-code');

        const address = `${addressLine1 ?? ''}${unitType || unitNumber ? ', ' : ''}${unitType ?? ''}` +
            `${unitType && unitNumber ? ' ' : ''}${unitNumber ?? ''}\n` +
            `${addressLine2 ? addressLine2 + '\n' : ''}` +
            `${city ?? ''}${city && province ? ', ' : ''}${province ?? ''}\n` +
            `${country ?? ''}\n` +
            `${postalCode ?? ''}`;

        return address.trim();
    }
}
