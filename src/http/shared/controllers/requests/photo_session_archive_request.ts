import { IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PhotoSessionArchiveRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public sessionId: string;
}
