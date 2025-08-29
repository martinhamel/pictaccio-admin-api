import { IsBoolean, IsNumber, IsNumberString, IsOptional, ValidateNested } from 'class-validator';
import { SessionColor } from '../../../../http/shared/controllers/nested/session_color';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';
import { Transform } from 'class-transformer';

export class SessionOptions {
    @ValidateNested()
    public color: SessionColor;

    @IsBoolean()
    public touchupsEnable: boolean;

    @IsBoolean()
    public digitalGroupsEnable: boolean;

    @IsOptional()
    @IsNullable()
    @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
    public touchupsPrice: number[] | null;

    @IsOptional()
    @IsBoolean()
    public touchupsPriceIsScaling: boolean;

    @IsOptional()
    @IsBoolean()
    public digitalEnable: boolean;

    @IsOptional()
    @IsBoolean()
    public digitalAutoSendEnable: boolean;

    @IsOptional()
    @IsNullable()
    @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
    public digitalPrice: number[] | null;

    @IsOptional()
    @IsNullable()
    @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
    public digitalGroupPrice: number[] | null;

    @IsOptional()
    @IsBoolean()
    public digitalPriceIsScaling: boolean;

    @IsOptional()
    @IsBoolean()
    public digitalGroupPriceIsScaling: boolean;

    @IsOptional()
    @IsBoolean()
    public discountEnable: boolean;

    @IsOptional()
    @IsNumberString()
    @Transform(({ value }) => value.toString())
    public discountCatalogId: string;

    @IsOptional()
    @IsNullable()
    @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
    public discountPrices: number[] | null;

    @IsOptional()
    @IsNullable()
    @IsNumber({ maxDecimalPlaces: 2 }, { each: true })
    public discountGroupPrices: number[] | null;
}
