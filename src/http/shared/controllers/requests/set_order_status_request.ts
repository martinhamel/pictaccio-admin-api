import { IsIn, IsNumberString } from '@loufa/class-validator';
import { OrderStatus, OrderStatuses } from '@pictaccio/shared/src/types/order_status';
import { Transform } from 'class-transformer';

export class SetOrderStatusRequest {
    @IsNumberString()
    @Transform(({ value }) => value.toString())
    public id: string;

    @IsIn(OrderStatuses)
    public status: OrderStatus;
}
