import { IsHexColor, IsNumber, IsString } from '@loufa/class-validator';
import { CssStyleDescription } from '@pictaccio/shared/src/types/css_color_descriptor';

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
