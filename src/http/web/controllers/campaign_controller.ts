import { Authorized, Body, CurrentUser, JsonController, Post, Req } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { randomValue } from '@pictaccio/admin-api/core/random_value';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import { Inject, Service } from 'typedi';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { User } from '@pictaccio/shared/src/types/user';
import { CampaignCreateBulkCodesRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/campaign_create_bulk_codes_request';
import { CampaignCreateBulkCodesResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/campaign_create_bulk_codes_response';
import { Request } from '@pictaccio/admin-api/types/request';
import { DataTableCreateBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_create_base_request';
import { DataTableBaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/data_table_base_response';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import { TransactionalPromoCodeCampaign } from '@pictaccio/admin-api/database/entities/transactional_promo_code_campaign';
import { TransactionalPromoCode } from '@pictaccio/admin-api/database/entities/transactional_promo_code';
import { DataTableDeleteBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_delete_base_request';
import { DataTableReadBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_read_base_request';
import { DataTableUpdateBaseRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_update_base_request';
import { PromoService } from '@pictaccio/admin-api/services/promo_service';

@Service()
@JsonController('/campaign')
export class CampaignController {
    constructor(@Inject('promo') private _promo: PromoService) {
    }

    @Authorized('create:campaign')
    @Post('/create')
    async createCampaign(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCodeCampaign, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:campaign')
    @Post('/delete')
    async deleteCampaign(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCodeCampaign, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:campaign')
    @Post('/read')
    async readCampaign(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCodeCampaign, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:campaign')
    @Post('/update')
    async updateCampaign(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCodeCampaign, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:campaign')
    @Post('/promo-code/create')
    async createPromoCode(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCode, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:campaign')
    @Post('/promo-code/delete')
    async deletePromoCode(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCode, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:campaign')
    @Post('/promo-code/read')
    async readPromoCode(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCode, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:campaign')
    @Post('/promo-code/update')
    async updatePromoCode(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalPromoCode, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:campaign')
    @Post('/bulk-code-creation')
    @ResponseSchema(CampaignCreateBulkCodesResponse)
    async createBulkCodes(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: CampaignCreateBulkCodesRequest): Promise<CampaignCreateBulkCodesResponse> {
        logger.info(`[CampaignController] User ${user.email} requested bulk code creation`, {
            area: 'http/web',
            subarea: 'controller/campaign',
            action: 'user:bulk-code-creation',
            controller_action: 'bulkCodeCreation',
            email: user.email,
            ...httpCommonFields(request)
        });

        try {
            const codes: string[] = [];

            const campaign = await TransactionalPromoCodeCampaign.findOneOrFail({ where: { id: body.campaignId } });

            do {
                const considerCodes = await this.generateCodes(campaign.code_prefix, body.count - codes.length);
                const codesReport = await TransactionalPromoCode.codesExist(considerCodes);

                codes.push(...considerCodes.filter(code => !codesReport[code]));
            } while (codes.length < body.count);

            await TransactionalPromoCode.createPromoCodes(codes, body.campaignId);

            logger.info(`[CampaignController] User ${user.email} successfully created promo-codes`, {
                area: 'http/web',
                subarea: 'controller/campaign',
                action: 'user:bulk-code-creation',
                controller_action: 'bulkCodeCreation',
                email: user.email,
                ...httpCommonFields(request)
            });

            return {
                status: 'great-success'
            };
        } catch (error) {
            logger.error(
                `[CampaignController] User ${user.email} failed to create promo-codes. Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/campaign',
                action: 'user:bulk-code-creation',
                controller_action: 'bulkCodeCreation',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }
    }

    /* PRIVATE */
    private async generateCodes(prefix: string, count: number): Promise<string[]> {
        const characterSet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const length = 8;
        const codes: string[] = [];

        for (let i = 0; i < count; ++i) {
            let code = prefix;

            for (let j = 0; j < length; ++j) {
                code += characterSet.charAt(await randomValue(characterSet.length - 1));
            }

            codes.push(code);
        }

        return codes;
    }
}
