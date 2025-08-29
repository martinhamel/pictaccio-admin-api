import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import {
    VerifySubjectCodesResponse
} from '../../../http/shared/controllers/responses/verify_subject_codes_response';
import { Request } from '../../../types/request';
import { Service } from 'typedi';
import { Body, Get, JsonController, Post, Req, Res } from '@loufa/routing-controllers';
import { Authorized, QueryParams } from '@loufa/routing-controllers';
import { SubjectCodeGenerateRequest } from '../../../http/shared/controllers/requests/suject_code_generate_request';
import { SubjectCodeGenerateResponse } from '../../../http/shared/controllers/responses/subject_code_generate_response';
import { randomValue } from '../../../core/random_value';
import { TransactionalSubject } from '../../../database/entities/transactional_subject';

@Service()
@JsonController('/subject-code')
export class SubjectCodeController {
    @Authorized('read:session')
    @Get('/generate')
    public async generate(@QueryParams() query: SubjectCodeGenerateRequest): Promise<SubjectCodeGenerateResponse> {
        const codes: string[] = [];

        if (query.prefix === undefined || query.prefix === 'undefined') {
            query.prefix = '';
        }

        do {
            const considerCodes = await this.generateCodes(
                query.characterSet, query.prefix, query.length, query.count - codes.length);
            const codesReport = await TransactionalSubject.codesExist(considerCodes);

            codes.push(...considerCodes.filter(code => !codesReport[code]));
        } while (codes.length < query.count);

        return {
            status: 'great-success',
            codes
        };
    }

    @Authorized('create:session')
    @Post('/verify-codes')
    @ResponseSchema(VerifySubjectCodesResponse)
    public async verifySubjectCodes(@Body() body: string[],
        @Req() request: Request,
        @Res() response: Response): Promise<VerifySubjectCodesResponse> {
        const codesExist = Object.entries(await TransactionalSubject.codesExist(body))
            .map(([code, exists]) => exists ? code : null)
            .filter(code => code !== null);

        return {
            status: 'great-success',
            codesExist
        };
    }

    /* PRIVATE */
    private async generateCodes(characterSet: string,
        prefix: string,
        length: number,
        count: number): Promise<string[]> {
        const codes: string[] = [];

        for (let i = 0; i < count; ++i) {
            let code = prefix;

            for (let j = 0; j < length; ++j) {
                code += characterSet.charAt(await randomValue(characterSet.length - 1));
            }

            codes.push(code);
        }

        return codes;
    }
}
