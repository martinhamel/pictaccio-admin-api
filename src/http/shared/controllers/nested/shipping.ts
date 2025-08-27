import { IsNumber, IsNumberString, IsString } from '@loufa/class-validator';
import { LocalizedString } from '@pictaccio/admin-api/types/localized_string';
import { Transform } from 'class-transformer';

export class Shipping {
    @IsNumberString()
    @Transform(({ value }) => value.toString())
    public id: string;

    @IsString()
    public name: LocalizedString;

    @IsString()
    public comment?: string;
}
