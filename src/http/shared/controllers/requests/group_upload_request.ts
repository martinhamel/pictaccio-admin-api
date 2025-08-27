import { IsNumber, IsNumberString, IsString, ValidateNested } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

class GroupUploadData {
    @IsNumber()
    public photoCount: number;

    @IsString()
    public name: string;

    public extra?: { [key: string]: string };
}

export class GroupUploadRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public sessionId: string;

    @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
    @ValidateNested()
    public data: GroupUploadData;
}
