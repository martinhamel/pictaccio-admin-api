import { IsDefined } from 'class-validator';

export class CreateBulkPromoCode {
    @IsDefined()
    public campaignId: string;

    @IsDefined()
    public amount: number;
}
