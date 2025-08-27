import { IsBoolean, IsNumber } from '@loufa/class-validator';

export class ShippingPromo {
    @IsBoolean()
    public enabled: boolean;

    @IsNumber()
    public threshold: number;
}
