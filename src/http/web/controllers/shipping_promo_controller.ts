import { Authorized, Body, CurrentUser, JsonController, Post, Req } from '@loufa/routing-controllers';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { PublicStoreConfig } from '@pictaccio/admin-api/database/entities/public_store_config';
import {
    UpdateShippingPromoRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/update_shipping_promo_request';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import {
    ReadShippingPromoResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/read_shipping_promo_response';
import { Request } from '@pictaccio/admin-api/types/request';
import { User } from '@pictaccio/shared/src/types/user';
import { Service } from 'typedi';

@Service()
@JsonController('/shipping-promo')
export class ShippingPromoController {
    constructor() {
    }

    @Authorized()
    @Post('/read-shipping-promo')
    public async readShippingPromo(@CurrentUser() user: User,
        @Req() request: Request): Promise<ReadShippingPromoResponse> {
        try {
            const promo = JSON.parse((await PublicStoreConfig.get('promo-free-shipping')) ??
                '{"threshold":0,"enabled":false}');
            return { status: 'great-success', promo: promo };
        } catch (error) {
            logger.error(`[ShippingPromoController] User ${user.email} failed to read the free shipping promo. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/shipping-promo',
                action: 'user:read-shipping-promo',
                controller_action: 'readShippingPromo',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return { status: 'failed', promo: null };
        }
    }

    @Authorized()
    @Post('/update-shipping-promo')
    public async updateShippingPromo(@CurrentUser() user: User,
        @Req() request: Request,
        @Body() body: UpdateShippingPromoRequest): Promise<BaseResponse> {
        try {
            await PublicStoreConfig.set('promo-free-shipping', JSON.stringify(body));
            return { status: 'great-success' };
        } catch (error) {
            logger.error(`[ShippingPromoController] User ${user.email} failed to update a free shipping promo. ` +
                `Reason: ${error.message}`, {
                area: 'http/web',
                subarea: 'controller/shipping-promo',
                action: 'user:update-shipping-promo',
                controller_action: 'updateShippingPromo',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return { status: 'failed' };
        }
    }
}
