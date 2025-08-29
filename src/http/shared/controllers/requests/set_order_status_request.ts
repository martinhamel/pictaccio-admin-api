import { IsIn, IsNumberString } from 'class-validator';
import { OrderStatus, OrderStatuses } from '@pictaccio/shared/types/order_status';
import { Transform } from 'class-transformer';

export class SetOrderStatusRequest {
    @IsNumberString()
    @Transform(({ value }) => value.toString())
    public id: string;

    @IsIn(OrderStatuses)
    public status: OrderStatus;
}
