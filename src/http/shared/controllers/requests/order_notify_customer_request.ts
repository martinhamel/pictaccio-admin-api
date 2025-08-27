import { IsNumberString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class OrderNotifyCustomerRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public orderId: string;
}
