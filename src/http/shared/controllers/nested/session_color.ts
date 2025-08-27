import { IsBoolean, IsHexColor } from '@loufa/class-validator';
import { SessionColor as SessionColorType } from '@pictaccio/shared/src/types/session_color';

export class SessionColor implements SessionColorType {
    @IsHexColor()
    public color1: string;

    @IsHexColor()
    public color2: string;

    @IsBoolean()
    public multipleColors: boolean;
}
