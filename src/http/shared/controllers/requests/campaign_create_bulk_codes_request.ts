import { IsNumber, IsNumberString } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

export class CampaignCreateBulkCodesRequest {
    @IsNumber()
    count: number;

    @IsNumberString()
    @Transform(({value}) => value.toString())
    campaignId: string;
}
