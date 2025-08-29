import { IsNumber, IsNumberString, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class PhotoSessionRemoveVersionRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public itemId: string;

    @IsString()
    public original: string;

    @IsString()
    public version: string;
}
