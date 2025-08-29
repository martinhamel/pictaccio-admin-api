import { IsHexColor } from 'class-validator';

export class NamedColors {
    @IsHexColor()
    accent: string;
}
