import { Response } from 'express';
import { promises as fsPromises } from 'fs';
import {
    Authorized,
    Body,
    Get,
    JsonController,
    Param,
    Post,
    Req,
    Res,
    ViewRender,
    ViewObj,
    QueryParam
} from '@loufa/routing-controllers';
import { TFunction } from 'i18next';
import { readFile } from 'node:fs/promises';
import { join } from 'path';
import ImageService from '@pictaccio/admin-api/services/image_service';
import { Container, Inject, Service } from 'typedi';
import { Request } from '@pictaccio/admin-api/types/request';
import { TransactionalBackground } from '@pictaccio/admin-api/database/entities/transactional_background';
import { MailerItem, MailerInterface } from '@pictaccio/admin-api/core/mailer_interface';
import {
    DataTable,
    DataTableCreateRequest,
    DataTableDeleteRequest,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import { AdminUser } from '@pictaccio/admin-api/database/entities/admin_user';
import { DataTableReadBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_read_base_request';
import { T } from '@pictaccio/admin-api/http/shared/decorators/t';
import { View } from '@pictaccio/admin-api/http/web/views/view';
import { DataTableCreateBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_create_base_request';
import { DataTableUpdateBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_update_base_request';
import { DataTableDeleteBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_delete_base_request';
import { promisify } from 'util';

@Service()
@JsonController()
export class ExampleController {
    @Inject('config')
    private _config;

    @Inject('mailer')
    private _mailer: MailerInterface;

    @Inject('image')
    private _imageService: ImageService;

    /**
     * Example GET request handler
     */
    @Get('/test')
    test(@T() t: TFunction): any {
        return {
            // message: 'test',
            // translated: t('cancel'),
            // translatedWithNamespace: t('messages:test'),
            // translatedMissingNamespace: t('missing:test'),
            // translatedMissingKey: t('missing'),
            // notification: t('notifications:missingProductThemeImages.title')
        };
    }

    @Get('/backgrounds')
    async backgrounds(): Promise<TransactionalBackground[]> {
        return await TransactionalBackground.find();
    }

    /**
     * Send test email
     */
    @Get('/testMessage')
    async testSendMessage(@Res() response: Response): Promise<string> {
        //const mailerSend = await loaderState.request('Mailer.send');
        const message: MailerItem = {
            from: 'test@mail.com',
            message: 'This is a test',
            subject: 'This is a test',
            to: 'test@mail.com'
        };

        try {
            await this._mailer.send(message);
        } catch (error) {
            response.status(500);
            return 'Failed ' + error.message + '  ' + error.stack;
        }

        return 'Message sent';
    }

    @Authorized('read:test')
    @Get('/only-admins')
    async onlyAdmins(@Req() request: Request): Promise<string> {
        return request.toString();
    }

    @Get('/render-test')
    @ViewRender('test')
    async renderTest(@ViewObj() view: View): Promise<any> {
        view.setTitle('test title');
        view.addScripts('app.min.js', true, true);
        return {
            test: 'patate'
        };
    }

    @Get('/home')
    @ViewRender('home')
    async renderHome(@ViewObj() view: View): Promise<any> {
        view.setTitle('home');
        view.addScripts('app.min.js', true, true);
    }

    @Get('/faq')
    @ViewRender('faq')
    async renderFaq(@ViewObj() view: View): Promise<any> {
        view.setTitle('faq');
        view.addScripts('app.min.js', true, true);
    }

    @Get('/request-a-quote')
    @ViewRender('request')
    async renderRequestAQuote(@ViewObj() view: View): Promise<void> {
        view.setTitle('Request a quote');
        view.addScripts('app.min.js', true, true);
    }

    @Get('/contact-us')
    @ViewRender('contact')
    async renderContactUs(@ViewObj() view: View): Promise<void> {
        view.setTitle('Contact us');
        view.addScripts('app.min.js', true, true);
    }

    @Get('/legal-document')
    @ViewRender('legal')
    async renderLegalDocument(@ViewObj() view: View): Promise<any> {
        view.setTitle('Legal document');
        view.addScripts('app.min.js', true, true);
    }

    @Get('/docs/:slug')
    @ViewRender('documentation')
    async renderDocumentation(@ViewObj() view: View, @Param('slug') slug: string): Promise<any> {
        view.setTitle(slug);
        view.addScripts('app.min.js', true, true);

        const locale = 'en';
        const docs = {
            test1: 'test1.md'
        };

        return {
            mdDoc: await (
                await fsPromises.readFile(
                    join(this._config.env.dirs.docsPages, locale, docs[slug])
                )
            ).toString()
        };
    }

    @Post('/test-dbtable_create')
    async create(@Req() request: Request, @Body() body: DataTableCreateBaseRequest): Promise<any> {
        const dataTable = new DataTable(TransactionalBackground, request);

        const test = await dataTable.processCreate(body as unknown as DataTableCreateRequest<TransactionalBackground>);
        return test;
    }

    @Post('/test-dbtable_delete')
    async delete(@Req() request: Request, @Body() body: DataTableDeleteBaseRequest): Promise<any> {
        const dataTable = new DataTable(AdminUser, request);

        const test = await dataTable.processDelete(body as unknown as DataTableDeleteRequest<AdminUser>);
        return test;
    }

    @Post('/test-dbtable_read')
    async read(@Req() request: Request, @Body() body: DataTableReadBaseRequest): Promise<any> {
        const dataTable = new DataTable(AdminUser, request);

        const test = await dataTable.processRead(body as unknown as DataTableReadRequest<AdminUser>);
        return test;
    }

    @Post('/test-dbtable_update')
    async update(@Req() request: Request, @Body() body: DataTableUpdateBaseRequest): Promise<any> {
        const dataTable = new DataTable(AdminUser, request);

        const test = await dataTable.processUpdate(body as unknown as DataTableUpdateRequest<AdminUser>);
        return test;
    }

    @Authorized('read:session')
    @Get('/test-watermark-thumbnail')
    public async testWatermarkThumbnail(@QueryParam('image') imagePath: string,
        @Res() response: Response): Promise<Response> {
        const imageService = Container.get<ImageService>('image');
        const thumbnail = await imageService.getWatermarkedThumbnails([imagePath]);

        //response.status(200);
        await promisify<string, void>
            (response.sendFile.bind(response))(join(this._config.env.dirs.public, thumbnail[0]));
        return response;
    }
}
