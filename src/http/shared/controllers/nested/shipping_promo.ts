import { IsBoolean, IsNumber } from 'class-validator';

export class ShippingPromo {
    @IsBoolean()
    public enabled: boolean;

    @IsNumber()
    public threshold: number;
}
