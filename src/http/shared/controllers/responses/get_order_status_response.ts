import { IsIn } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { OrderStatus, OrderStatuses } from '@pictaccio/shared/src/types/order_status';

export class GetOrderStatusResponse extends BaseResponse {
    @IsIn(OrderStatuses)
    public orderStatus?: OrderStatus;
}
