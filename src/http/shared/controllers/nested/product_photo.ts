import { IsString, IsUrl } from '@loufa/class-validator';

export class ProductPhoto {
    @IsString()
    public theme?: string;

    @IsUrl()
    public url: string;
}
