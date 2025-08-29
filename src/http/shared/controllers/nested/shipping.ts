import { IsNumber, IsNumberString, IsString } from 'class-validator';
import { LocalizedString } from '../../../../types/localized_string';
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
