import { IsNumber, IsNumberString, IsString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class PhotoPublish {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public orderId: string;

    @IsNumberString()
    @Transform(({value}) => value.toString())
    public itemId: string;

    @IsString()
    public originalPath: string;

    @IsString()
    public versionPath: string;
}
