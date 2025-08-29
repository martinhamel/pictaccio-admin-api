import { Response } from 'express';
import { changeLanguage } from 'i18next';
import { Inject, Service } from 'typedi';
import { Authorized, Body, Get, JsonController, Post, Res, Session } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { ConfigSchema } from '../../../core/config_schema';
import { UserSession } from '../../../types/user_session';
import { SessionGetLangResponse } from '../../../http/shared/controllers/responses/session_get_lang_response';
import { SessionPostLangResponse } from '../../../http/shared/controllers/responses/session_post_lang_response';
import { SessionPostLangRequest } from '../../../http/shared/controllers/requests/session_post_lang_request';

@Service()
@JsonController('/session')
export class SessionController {
    constructor(@Inject('config') private _config: ConfigSchema) {
    }

    @Authorized()
    @Get('/lang')
    @ResponseSchema(SessionGetLangResponse)
    public async getLang(@Session() session: UserSession): Promise<SessionGetLangResponse> {
        return {
            status: 'great-success',
            lang: session.lang || this._config.locales.fallbacks.lang
        };
    }

    @Authorized()
    @Post('/lang')
    @ResponseSchema(SessionPostLangResponse)
    public async postLang(@Body() body: SessionPostLangRequest,
        @Session() session: UserSession,
        @Res() response: Response): Promise<SessionPostLangResponse> {

        if (!this._config.locales.supported.includes(body.lang)) {
            response.status(400);
            return {
                status: 'failed'
            };
        }

        await changeLanguage(body.lang);
        session.lang = body.lang;
        return {
            status: 'great-success'
        };
    }
}
