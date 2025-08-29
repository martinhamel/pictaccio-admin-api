import { IsNumber, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CampaignCreateBulkCodesRequest {
    @IsNumber()
    count: number;

    @IsNumberString()
    @Transform(({value}) => value.toString())
    campaignId: string;
}
