import { IsDefined, IsNumber } from 'class-validator';

export class SubjectCodeGenerateRequest {
    @IsDefined()
    public characterSet: string;

    @IsDefined()
    public prefix: string;

    @IsNumber()
    public length: number;

    @IsNumber()
    public count: number;
}
