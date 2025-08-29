import { IsNumber, ValidateNested } from 'class-validator';
import { CanadianTaxLocality } from '../../../../http/shared/controllers/nested/canadian_tax_locality';
import { TransactionInfo } from '../../../../http/shared/controllers/nested/transaction_info';

export class Transaction {
    @IsNumber()
    public subtotal: number;

    @IsNumber()
    public promo: number;

    @IsNumber()
    public shipping: number;

    @ValidateNested()
    public taxes: CanadianTaxLocality;

    @IsNumber()
    public total: number;

    @ValidateNested({ each: true })
    public transactions: TransactionInfo[];
}
