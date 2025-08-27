import { IsNumberString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class DeleteCommentRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public commentId: string;
}
