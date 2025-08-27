import { IsHexColor } from '@loufa/class-validator';

export class NamedColors {
    @IsHexColor()
    accent: string;
}
