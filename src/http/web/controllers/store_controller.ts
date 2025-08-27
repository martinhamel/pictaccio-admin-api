import { checkFileMimeType } from '@loufa/loufairy-server/src/entry';
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParam,
    Req,
    Res
} from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { config } from '@pictaccio/admin-api/config';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { PublicAppIntegration } from '@pictaccio/admin-api/database/entities/public_app_integration';
import { PublicStoreConfig } from '@pictaccio/admin-api/database/entities/public_store_config';
import {
    SetAppIntegrationRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/get_app_integration_request';
import {
    EmailAddress,
    SetStoreConfigRequest,
    TaxLocality
} from '@pictaccio/admin-api/http/shared/controllers/requests/set_store_config_request';
import {
    SetStoreLanguagesRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/set_store_languages_request';
import {
    SetStoreShutdownRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/set_store_shutdown_request';
import { SetStoreUrls } from '@pictaccio/admin-api/http/shared/controllers/requests/set_store_urls';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import {
    GetAppIntegrationResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_app_integrations_response';
import {
    GetAvailableLanguagesResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_available_languages_response';
import { GetStoreShutdownResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/get_shutdown_response';
import {
    GetStoreConfigResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_store_config_response';
import {
    GetStoreLanguagesResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_store_languages_response';
import {
    GetStoreNotifyEmailsResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/get_store_notify_emails_response';
import { GetStoreUrls } from '@pictaccio/admin-api/http/shared/controllers/responses/get_store_urls';
import {
    SetAppIntegrationResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/set_app_integration_response';
import {
    SetStoreConfigResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/set_store_config_response';
import {
    StoreConfiguredResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/store_configured_response';
import { PubsubService } from '@pictaccio/admin-api/services/pubsub_service';
import StoreConfigService from '@pictaccio/admin-api/services/store_config_service';
import { Request } from '@pictaccio/admin-api/types/request';
import { AppIntegrationCategories } from '@pictaccio/shared/src/types/app_integration_categories';
import { User } from '@pictaccio/shared/src/types/user';
import { AppIntegrationApp } from '@pictaccio/shared/src/types/app_integration_app';
import { Response } from 'express';
import { Inject, Service } from 'typedi';
import { promisify } from 'util';
import { Console } from 'console';

@Service()
@JsonController('/store')
export class StoreController {
    constructor(@Inject('fast-store') private fastStore: FastStoreInterface,
        @Inject('pubsub') private pubsub: PubsubService,
        @Inject('config') private config: ConfigSchema,
        @Inject('store-config') private _storeConfig: StoreConfigService) {
    }

    @Authorized('read:store-config')
    @Get('/get-app-integration')
    @ResponseSchema(GetAppIntegrationResponse)
    public async getAppIntegration(@QueryParam('app') app: AppIntegrationApp): Promise<GetAppIntegrationResponse> {
        const integrations = await PublicAppIntegration.get(app);

        if (!integrations) {
            return {
                status: 'failed',
                context: 'NOT_FOUND'
            };
        }

        return {
            status: 'great-success',
            integrations
        };
    }

    @Get('/get-available-languages')
    @ResponseSchema(GetAvailableLanguagesResponse)
    public async getAvailableLanguages(): Promise<GetAvailableLanguagesResponse> {
        return {
            status: 'great-success',
            languages: ['en', 'fr']
        };
    }

    @Authorized()
    @Get('/get-config')
    @ResponseSchema(GetStoreConfigResponse)
    public async getConfig(): Promise<GetStoreConfigResponse> {
        const response = new GetStoreConfigResponse();

        response.config.storeName = await PublicStoreConfig.get('store-name');
        response.config.storeAccentColor = await PublicStoreConfig.get('store-access-color');
        response.config.address.addressLine1 = await PublicStoreConfig.get('store-address-address-line1');
        response.config.address.addressLine2 = await PublicStoreConfig.get('store-address-address-line2');
        response.config.address.unitType = await PublicStoreConfig.get('store-address-unit-type');
        response.config.address.unitNumber = await PublicStoreConfig.get('store-address-unit-number');
        response.config.address.city = await PublicStoreConfig.get('store-address-city');
        response.config.address.province = await PublicStoreConfig.get('store-address-region');
        response.config.address.country = await PublicStoreConfig.get('store-address-country');
        response.config.address.postalCode = await PublicStoreConfig.get('store-address-postal-code');

        try {
            response.config.emailAddresses = JSON.parse(await PublicStoreConfig.get('store-emails'));
        } catch (error) {
            // Pass
        }

        try {
            response.config.phones = JSON.parse(await PublicStoreConfig.get('store-phones'));
        } catch (error) {
            // Pass
        }

        response.config.taxLocality = await PublicStoreConfig.get('tax-locality') as TaxLocality;
        response.config.taxRateHst = await PublicStoreConfig.get('tax-rate-hst');
        response.config.taxRateGst = await PublicStoreConfig.get('tax-rate-gst');
        response.config.taxRateQst = await PublicStoreConfig.get('tax-rate-qst');
        response.config.taxRatePst = await PublicStoreConfig.get('tax-rate-pst');
        response.config.taxIdHst = await PublicStoreConfig.get('tax-id-hst');
        response.config.taxIdGst = await PublicStoreConfig.get('tax-id-gst');
        response.config.taxIdQst = await PublicStoreConfig.get('tax-id-qst');
        response.config.taxIdPst = await PublicStoreConfig.get('tax-id-pst');

        response.status = 'great-success';

        return response;
    }

    @Authorized('read:store-config')
    @Get('/get-shutdown')
    @ResponseSchema(GetStoreShutdownResponse)
    public async getShutdown(): Promise<GetStoreShutdownResponse> {
        return {
            status: 'great-success',
            shutdown: await this.fastStore.get('shared:shutdown-status') === 'shutdown',
            message: await this.fastStore.get('shared:shutdown-message')
        };
    }

    @Authorized('read:store-config')
    @Get('/get-notify-emails')
    @ResponseSchema(GetStoreNotifyEmailsResponse)
    public async getNotifyEmails(): Promise<GetStoreNotifyEmailsResponse> {
        return {
            status: 'great-success',
            emails: JSON.parse(await PublicStoreConfig.get('store-notify-emails'))
        };
    }

    @Get('/get-languages')
    @ResponseSchema(GetStoreLanguagesResponse)
    public async getLanguages(): Promise<GetStoreLanguagesResponse> {
        return {
            status: 'great-success',
            languages: JSON.parse((await PublicStoreConfig.get('store-languages')) ??
                '[{"primary":true,"order":0,"locale":"en"}]')
        };
    }

    @Authorized('read:story-config')
    @Get('/get-urls')
    @ResponseSchema(GetStoreUrls)
    public async getStoreUrls(): Promise<GetStoreUrls> {
        return {
            status: 'great-success',
            contactUrl: await PublicStoreConfig.get('contact-url'),
            legalUrl: await PublicStoreConfig.get('legal-url'),
            termsAndConditionUrl: await PublicStoreConfig.get('terms-and-conditions-url')
        };
    }

    @Authorized('read:store-config')
    @Get('/get-watermark-image')
    @ResponseSchema(BaseResponse)
    public async getWatermarkImage(@Res() response: Response): Promise<void> {
        const watermark = await PublicStoreConfig.get('watermark-image');

        if (watermark !== 'uploaded') {
            response.status(404);
            response.end();
            return;
        }

        return await promisify<string, void>(response.sendFile.bind(response))(this.config.app.files.watermarkImage);
    }

    @Authorized('read:store-config')
    @Get('/has-watermark-image')
    @ResponseSchema(BaseResponse)
    private async hasWatermarkImage(): Promise<BaseResponse> {
        const watermark = await PublicStoreConfig.get('watermark-image');

        return {
            status: watermark === 'uploaded' ? 'great-success' : 'failed'
        };
    }

    @Authorized()
    @Get('/is-configured')
    @ResponseSchema(StoreConfiguredResponse)
    private async isConfigured(): Promise<StoreConfiguredResponse> {
        const configured = await this._storeConfig.isConfigured();

        return {
            status: 'great-success',
            ...configured
        };
    }

    @Authorized('update:store-config')
    @Post('/set-app-integration')
    @ResponseSchema(SetAppIntegrationResponse)
    public async setAppIntegration(@Body() body: SetAppIntegrationRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<SetAppIntegrationResponse> {
        await this._checkForConflictingCCProcessors(body.integrations.map(integration => integration.app));

        const appIntegration = await Promise.all(
            body.integrations.map(integration => PublicAppIntegration.set(integration.app, integration.configuration))
        );

        for await (const integration of body.integrations) {
            await this.pubsub.publishAppIntegrationsChanged(integration.app);
        }

        return {
            status: 'great-success',
            appIntegration
        };
    }

    @Authorized('update:store-config')
    @Post('/set-config')
    @ResponseSchema(SetStoreConfigResponse)
    public async setConfig(@Body() body: SetStoreConfigRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<SetStoreConfigResponse> {
        const handlers = {
            storeName: name => PublicStoreConfig.set('store-name', name),
            address: address => Promise.all([
                address.addressLine1 && PublicStoreConfig.set('store-address-address-line1', address.addressLine1),
                address.addressLine2 && PublicStoreConfig.set('store-address-address-line2', address.addressLine2),
                address.city && PublicStoreConfig.set('store-address-city', address.city),
                address.province && PublicStoreConfig.set('store-address-region', address.province),
                address.country && PublicStoreConfig.set('store-address-country', address.country),
                address.postalCode && PublicStoreConfig.set('store-address-postal-code', address.postalCode)
            ]),
            emailAddresses: (addresses: EmailAddress[]) =>
                PublicStoreConfig.set('store-emails', JSON.stringify(addresses)),
            phones: async (phones: { name: { [key: string]: string }, phone: string }[]) => {
                await PublicStoreConfig.set('store-phones', JSON.stringify(phones));
            },
            taxLocality: locality => PublicStoreConfig.set('tax-locality', locality),
            taxRateHst: hst => PublicStoreConfig.set('tax-rate-hst', hst),
            taxRateGst: gst => PublicStoreConfig.set('tax-rate-gst', gst),
            taxRateQst: qst => PublicStoreConfig.set('tax-rate-qst', qst),
            taxRatePst: pst => PublicStoreConfig.set('tax-rate-pst', pst),
            taxIdHst: hstId => PublicStoreConfig.set('tax-id-hst', hstId),
            taxIdGst: gstId => PublicStoreConfig.set('tax-id-gst', gstId),
            taxIdQst: qstId => PublicStoreConfig.set('tax-id-qst', qstId),
            taxIdPst: pstId => PublicStoreConfig.set('tax-id-pst', pstId)
        };

        try {
            await Promise.all(Object.keys(body).map(config => {
                if (body[config]) handlers[config](body[config])
            })
            );
            await this.pubsub.publishStoreConfigChanged();
        } catch (error) {
            logger.error(`[StoreController] There was an error while setting store configurations`, {
                area: 'http/web',
                subarea: 'controller/store',
                action: 'store:set-config',
                controller_action: 'setConfig',
                error,
                ...httpCommonFields(request)
            });

            response.status(500);
            return {
                status: 'error',
                context: 'UNKNOWN_ERROR',
                correlationId: request.correlationId
            };
        }

        logger.info(`Setting new store configuration`, {
            configuration: body,
            ...httpCommonFields(request)
        });
        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/set-notify-emails')
    @ResponseSchema(BaseResponse)
    public async setNotifyEmails(@Body() body: string[],
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is changing the notify emails of the store`, {
            area: 'http/web',
            subarea: 'controller/store',
            action: 'store:set-notify-emails',
            controller_action: 'setNotifyEmails',
            email: user.email,
            emails: body,
            ...httpCommonFields(request)
        });

        await PublicStoreConfig.set('store-notify-emails', JSON.stringify(body));
        await this.pubsub.publishStoreNotifyEmailsChanged(body);

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/set-languages')
    @ResponseSchema(BaseResponse)
    public async setLanguages(@Body() body: SetStoreLanguagesRequest,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is changing the languages of the store`, {
            area: 'http/web',
            subarea: 'controller/store',
            action: 'store:set-languages',
            controller_action: 'setLanguages',
            email: user.email,
            languages: body.languages,
            ...httpCommonFields(request)
        });

        await PublicStoreConfig.set('store-languages', JSON.stringify(body.languages));
        await this.pubsub.publishConfiguredLanguagesChanged(body.languages);

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/set-shutdown')
    @ResponseSchema(BaseResponse)
    public async setShutdown(@Body() body: SetStoreShutdownRequest,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is changing the shutdown status of the store`, {
            email: user.email,
            shutdown: body.shutdown,
            ...httpCommonFields(request)
        });

        await this.fastStore.set('shared:shutdown-status', body.shutdown ? 'shutdown' : 'opened');
        await this.fastStore.set('shared:shutdown-message', body.message);
        await PublicStoreConfig.set('store-shutdown', JSON.stringify(body));

        await this.pubsub.publishStoreShutdownChanged(body.shutdown, body.message);

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/set-urls')
    @ResponseSchema(BaseResponse)
    public async setUrls(@Body() body: SetStoreUrls,
        @CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is changing the urls of the store`, {
            email: user.email,
            urls: body,
            ...httpCommonFields(request)
        });

        await PublicStoreConfig.set('contact-url', body.contactUrl);
        await PublicStoreConfig.set('legal-url', body.legalPageUrl);
        await PublicStoreConfig.set('terms-and-conditions', body.termsAndConditionsUrl);

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/set-watermark-image')
    @ResponseSchema(BaseResponse)
    public async setWatermarkImage(@CurrentUser() user: User,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is setting the watermark image of the store`, {
            src_email: user.email,
            ...httpCommonFields(request)
        });

        if (!request.files['watermark-image']) {
            logger.error(`User ${user.email} tried to set the watermark image but no file was provided`, {
                src_email: user.email,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'NO_FILE'
            };
        }

        const imageMimeType = process.platform === 'win32'
            ? 'image/png'
            : await checkFileMimeType(request.files['watermark-image']['data']);
        if (!['image/png'].includes(imageMimeType)) {
            logger.error(`User ${user.email} tried to set the watermark image but the file was not a PNG image`, {
                detected_mime_type: imageMimeType,
                src_email: user.email,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'INVALID_FORMAT'
            };
        }

        await request.files['watermark-image'].mv(config.app.files.watermarkImage);

        await PublicStoreConfig.set('watermark-image', 'uploaded');

        return {
            status: 'great-success'
        };
    }

    /* PRIVATE */
    private async _checkForConflictingCCProcessors(apps: AppIntegrationApp[]): Promise<void> {
        const activeApps = await PublicAppIntegration.getActiveList();

        if (!activeApps.some(app => AppIntegrationCategories[app] === 'cc-payment-processor')) {
            return;
        }

        if (apps.filter(app => AppIntegrationCategories[app] === 'cc-payment-processor').length > 1) {
            throw new BadRequestError('Cannot have multiple CC payment processors active at the same time');
        }
    }
}
