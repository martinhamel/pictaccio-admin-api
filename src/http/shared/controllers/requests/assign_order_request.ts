import { IsNumberString, IsOptional, IsUUID } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class AssignOrderRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public orderId: string;

    @IsOptional()
    @IsUUID()
    public userId: string;
}
