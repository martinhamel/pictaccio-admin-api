import { IsNumberString, IsString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class AddCommentRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public orderId: string;

    @IsString()
    public comment: string;
}
