import { IsIn } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { OrderStatus, OrderStatuses } from '@pictaccio/shared/types/order_status';

export class GetOrderStatusResponse extends BaseResponse {
    @IsIn(OrderStatuses)
    public orderStatus?: OrderStatus;
}
