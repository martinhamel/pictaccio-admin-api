import { IsBoolean, IsOptional, IsString } from '@loufa/class-validator';

export class ContactInfo {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    public email: string;

    @IsString()
    public phone: string;

    @IsString()
    public city: string;

    @IsString()
    public country: string;

    @IsString()
    public postalCode: string;

    @IsString()
    public region: string;

    @IsString()
    public streetAddress1: string;

    @IsString()
    @IsOptional()
    public streetAddress2?: string;

    @IsBoolean()
    public newsletter: boolean;
}
