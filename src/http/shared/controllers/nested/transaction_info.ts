import { IsBoolean, IsString } from '@loufa/class-validator';
import { TransactionType } from '@pictaccio/admin-api/types/transaction_type';

export class TransactionInfo {
    @IsString()
    public code: string;

    @IsBoolean()
    public success: boolean;

    @IsString()
    public type: TransactionType;
}
