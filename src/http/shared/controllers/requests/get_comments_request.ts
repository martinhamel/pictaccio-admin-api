import { IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCommentsRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public orderId: string;
}
