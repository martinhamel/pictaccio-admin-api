import { IsString, IsUrl } from 'class-validator';

export class ProductPhoto {
    @IsString()
    public theme?: string;

    @IsUrl()
    public url: string;
}
