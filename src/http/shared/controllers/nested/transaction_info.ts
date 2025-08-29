import { IsBoolean, IsString } from 'class-validator';
import { TransactionType } from '../../../../types/transaction_type';

export class TransactionInfo {
    @IsString()
    public code: string;

    @IsBoolean()
    public success: boolean;

    @IsString()
    public type: TransactionType;
}
