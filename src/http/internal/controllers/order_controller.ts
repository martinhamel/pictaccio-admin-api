import { Get, JsonController, QueryParam, Req, UnauthorizedError } from '@loufa/routing-controllers';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { NotFoundError } from '@pictaccio/admin-api/errors/not_found_error';
import { GetOrderIdsResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/get_order_ids_response';
import { AuthService } from '@pictaccio/admin-api/services/auth_service';
import { OrderService } from '@pictaccio/admin-api/services/order_service';
import { Request } from '@pictaccio/admin-api/types/request';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/order')
export class OrderController {
    constructor(@Inject('auth') private readonly auth: AuthService,
        @Inject('order') private readonly order: OrderService) { }

    @Get('/get-ids')
    async getOrderIds(@QueryParam('ids') ids: string, @Req() request: Request): Promise<GetOrderIdsResponse> {
        logger.info(`Retrieving orders`, {
            area: 'http/internal',
            subarea: 'controller/order',
            action: 'order:read',
            controller_action: 'getOrderIds',
            ...httpCommonFields(request)
        });

        if (!request.headers.authorization) {
            logger.error(`[OrderController] Unauthorized access to orders ${ids}`, {
                area: 'http/internal',
                subarea: 'controller/order',
                action: 'order:get',
                controller_action: 'getOrderIds',
                ...httpCommonFields(request)
            });
            throw new UnauthorizedError();
        }

        const parsedIds = ids.split(',');
        const tokenData = await this.auth.validateResourceToken(request.headers.authorization.slice(7));

        if (!tokenData.valid ||
            tokenData.resources.some(r => r.type !== 'order') ||
            parsedIds.some(id =>
                !tokenData.resources.map(r => parseInt(r.id.toString(), 10)).includes(parseInt(id, 10)))) {

            logger.error(`[OrderController] Unauthorized access to orders ${ids}`, {
                area: 'http/internal',
                subarea: 'controller/order',
                action: 'order:get',
                controller_action: 'getOrderIds',
                ...httpCommonFields(request)
            });
            throw new UnauthorizedError();
        }

        try {
            const orderDescriptors = await this.order.getOrders(parsedIds);

            return {
                status: 'great-success',
                orders: orderDescriptors
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            logger.error(
                `[OrderController] Error while retrieving orders ${ids}. Reason: ${error.message}`, {
                area: 'http/internal',
                subarea: 'controller/order',
                action: 'order:get',
                controller_action: 'getOrderIds',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                context: 'UNKNOWN_ERROR'
            };
        }
    }

    @Get('validate-token')
    async validateToken(@QueryParam('token') token: string, @Req() request: Request): Promise<boolean> {
        logger.info(`Validating token`, {
            area: 'http/internal',
            subarea: 'controller/order',
            action: 'order:read',
            controller_action: 'validateToken',
            ...httpCommonFields(request)
        });

        try {
            const tokenData = await this.auth.validateResourceToken(token);

            return tokenData.valid;
        } catch (error) {
            logger.error(
                `[OrderController] Error while validating token ${token}. Reason: ${error.message}`, {
                area: 'http/internal',
                subarea: 'controller/order',
                action: 'order:validate',
                controller_action: 'validateToken',
                error,
                ...httpCommonFields(request)
            });

            return false;
        }
    }
}
