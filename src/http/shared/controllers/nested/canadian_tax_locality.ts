import { IsNumber } from '@loufa/class-validator';

export class CanadianTaxLocality {
    @IsNumber()
    public gst?: number;

    @IsNumber()
    public hst?: number;

    @IsNumber()
    public pst?: number;

    @IsNumber()
    public qst?: number;
}
