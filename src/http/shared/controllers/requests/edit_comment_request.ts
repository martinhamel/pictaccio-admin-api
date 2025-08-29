import { IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class EditCommentRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public commentId: string;

    @IsString()
    public message: string;
}
