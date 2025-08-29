import { Authorized, Body, CurrentUser, Get, JsonController, Post, Req, Res } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { config } from '../../../config';
import { ConfigSchema } from '../../../core/config_schema';
import { PublicStoreConfig } from '../../../database/entities/public_store_config';
import { EditColorsRequest } from '../../../http/shared/controllers/requests/edit_colors_request';
import { BaseResponse } from '../../../http/shared/controllers/responses/base_response';
import { ColorsReadResponse } from '../../../http/shared/controllers/responses/colors_read_response';
import { Response } from 'express';
import { checkFileMimeType } from '@loufa/loufairy-server/src/entry';
import { Inject, Service } from 'typedi';
import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { Request } from '../../../types/request';
import { User } from '@pictaccio/shared/types/user';
import { BrandingService } from '../../../services/branding_service';
import { promisify } from 'util';

@Service()
@JsonController('/branding')
export class BrandingController {
    constructor(@Inject('branding') private branding: BrandingService, @Inject('config') private config: ConfigSchema) {
    }

    @Authorized('read:store-config')
    @Post('/colors/read')
    public async readColors(@CurrentUser() user: User,
        @Req() request: Request): Promise<ColorsReadResponse> {
        try {
            const colors = await this.branding.readColors();

            return {
                status: 'great-success',
                colors: colors
            };
        } catch (error) {
            logger.error(
                `[BrandingController] User ${user.email} failed to read the branding colors. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/branding',
                action: 'branding:read-colors',
                controller_action: 'readColors',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                colors: null
            };
        }
    }

    @Authorized('read:store-config')
    @Get('/logo/read')
    @ResponseSchema(BaseResponse)
    public async readLogo(@Res() response: Response): Promise<void> {
        const logo = await PublicStoreConfig.get('logo-image');


        if (logo !== 'uploaded') {
            response.status(404);
            response.end();
            return;
        }

        return await promisify<string, void>(response.sendFile.bind(response))(this.config.app.files.logoImage);
    }

    @Authorized('read:store-config')
    @Post('/urls/read')
    public async readUrls(@CurrentUser() user,
        @Req() request: Request): Promise<{ status: string, content: any }> {
        try {
            const urls = await this.branding.readUrls();

            return {
                status: 'great-success',
                content: urls
            };
        } catch (error) {
            logger.error(
                `[BrandingController] User ${user.email} failed to read the branding urls. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/branding',
                action: 'branding:read-urls',
                controller_action: 'readUrls',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                content: null
            };
        }
    }

    @Authorized('update:store-config')
    @Post('/colors/edit')
    public async saveColors(@CurrentUser() user: User,
        @Body() body: EditColorsRequest,
        @Req() request: Request): Promise<BaseResponse> {
        try {
            await this.branding.saveColors(body);
        } catch (error) {
            logger.error(
                `[BrandingController] User ${user.email} failed to save the branding colors. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/branding',
                action: 'branding:save-colors',
                controller_action: 'saveColors',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/logo/edit')
    @ResponseSchema(BaseResponse)
    public async saveLogo(@CurrentUser() user,
        @Req() request: Request): Promise<BaseResponse> {
        logger.info(`User ${user.email} is setting the logo image of the store`, {
            src_email: user.email,
            ...httpCommonFields(request)
        });

        if (!request.files['logo-image']) {
            logger.error(`User ${user.email} tried to set the logo image but no file was provided`, {
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
            : await checkFileMimeType(request.files['logo-image']['data']);
        if (!['image/png'].includes(imageMimeType)) {
            logger.error(`User ${user.email} tried to set the logo image but the file was not a PNG image`, {
                detected_mime_type: imageMimeType,
                src_email: user.email,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'INVALID_FORMAT'
            };
        }

        await request.files['logo-image'].mv(config.app.files.logoImage);

        await PublicStoreConfig.set('logo-image', 'uploaded');

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:store-config')
    @Post('/urls/edit')
    public async saveUrls(@CurrentUser() user,
        @Body() body: { content: any },
        @Req() request: Request): Promise<{ status: string }> {
        try {
            await this.branding.saveUrls(body.content);
        } catch (error) {
            logger.error(
                `[BrandingController] User ${user.email} failed to save the branding urls. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/branding',
                action: 'branding:save-urls',
                controller_action: 'saveUrls',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        return {
            status: 'great-success'
        };
    }
}
