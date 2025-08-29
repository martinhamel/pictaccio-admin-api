import { IsHexColor, IsNumber, IsString } from 'class-validator';
import { CssStyleDescription } from '@pictaccio/shared/types/css_color_descriptor';

export class EditColorsRequest {
    @IsHexColor()
    public accent: string;

    @IsHexColor()
    public background1: string;

    @IsHexColor()
    public background2: string;

    @IsHexColor()
    public background3: string;

    @IsHexColor()
    public importantBackground1: string;

    @IsHexColor()
    public importantBackground2: string;
}
