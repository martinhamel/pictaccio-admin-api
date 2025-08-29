import { IsBoolean } from 'class-validator';

export class StoreFeatures {
    @IsBoolean()
    languageConfigured: boolean;

    @IsBoolean()
    customizationConfigured: boolean;

    @IsBoolean()
    paymentConfigured: boolean;

    @IsBoolean()
    contactConfigured: boolean;

    @IsBoolean()
    taxesConfigured: boolean;
}
