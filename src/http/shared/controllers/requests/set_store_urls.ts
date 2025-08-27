import { IsUrl } from '@loufa/class-validator';

export class SetStoreUrls {
    @IsUrl()
    public contactUrl: string;

    @IsUrl()
    public legalPageUrl: string;

    @IsUrl()
    public termsAndConditionsUrl: string;
}
