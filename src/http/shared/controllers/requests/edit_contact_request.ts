import { IsBoolean, IsEmail, IsNumberString, IsOptional, IsString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class EditContactRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public id: string;

    @IsString()
    @IsOptional()
    public city?: string;

    @IsString()
    @IsOptional()
    public firstName?: string;

    @IsString()
    @IsOptional()
    public lastName?: string;

    @IsEmail()
    @IsOptional()
    public email?: string;

    @IsString()
    @IsOptional()
    public phone?: string;

    @IsString()
    @IsOptional()
    public postalCode?: string;

    @IsString()
    @IsOptional()
    public region?: string;

    @IsString()
    @IsOptional()
    public country?: string;

    @IsString()
    @IsOptional()
    public streetAddress1?: string;

    @IsString()
    @IsOptional()
    public streetAddress2?: string;

    @IsBoolean()
    @IsOptional()
    public newsletter?: boolean;
}
