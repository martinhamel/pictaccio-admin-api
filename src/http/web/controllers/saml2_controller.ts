import { Response } from 'express';
import {
    Body,
    Controller,
    Get,
    InternalServerError,
    QueryParam,
    Post,
    Req,
    Res,
    Session
} from '@loufa/routing-controllers';
import { Inject, Service } from 'typedi';
import { logger } from '@pictaccio/admin-api/core/logger';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import { Request } from '@pictaccio/admin-api/types/request';

@Service()
@Controller('/saml2')
export class SAML2Controller {

    @Inject('saml2')
    private _saml2;

    @Post('/assert')
    public async assert(@Req() request: Request,
        @Body() body: unknown,
        @Session() session: any,
        @Res() response: Response): Promise<string> {
        try {
            const { samlResponse } = await this._saml2.assert({ request_body: body });

            if (session.auth === undefined) {
                session.auth = {};
            }
            session.auth.isAuthenticated = true;
            session.auth.samlUser = samlResponse.user;

            logger.info(`Successfully processed idp assertion`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'assert',
                result: 'success',
                saml_response: samlResponse,
                ...httpCommonFields(request)
            });
            if (session.auth.returnUrl) {
                response.redirect(session.auth.returnUrl);
            } else {
                response
                    .status(200)
                    .send(`You're logged in`)
                    .end();
            }
        } catch (error) {
            logger.info(`Failed to process idp assertion`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'assert',
                result: 'failed',
                error,
                ...httpCommonFields(request)
            });
            throw new InternalServerError(`Failed to assert. ${error.message} ${error.stack}`);
        }

        return '';
    }

    @Get('/check-auth')
    public async checkAuth(@Req() request: Request,
        @Session() session: any,
        @Res() response: Response): Promise<string> {
        logger.debug(`In /check-auth, session.auth is ${session.auth === undefined ? 'undefined' : session.auth}`, {
            area: 'http/web',
            subarea: 'controller/saml2',
            action: 'user:login',
            controller_action: 'checkAuth',
            result: 'success',
            auth: session.auth,
            ...httpCommonFields(request)
        });

        if (session.auth === undefined || session.auth && !session.auth.isAuthenticated) {
            response.status(401);
        } else {
            response.status(200);
        }

        response.end();

        return '';
    }

    @Get('/metadata.xml')
    //@ContentType("application/xml")
    public async metadata(): Promise<void> {
        try {
            return this._saml2.createMetadata();
        } catch (error) {
            throw new InternalServerError(`Couldn't create metadata`);
        }
    }

    @Get('/login')
    public async login(@Req() request: Request, @Session() session: any,
        @QueryParam('return_url') returnUrl: string,
        @QueryParam('cookie') cookie: string,
        @Res() response: Response): Promise<void> {
        if (returnUrl) {
            if (session.auth === undefined) {
                session.auth = {};
            }
            session.auth.returnUrl = returnUrl;
        }

        try {
            const { loginUrl/*, requestId*/ } = await this._saml2.login();

            logger.info(`Successfully processed login`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'login',
                result: 'success',
                auth: session.auth,
                ...httpCommonFields(request)
            });

            response.redirect(loginUrl);
        } catch (error) {
            logger.error(`Failed to process login`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'login',
                result: 'failed',
                auth: session.auth,
                error,
                ...httpCommonFields(request)
            });
            throw new InternalServerError(`Couldn't login ${error.message} ${error.stack}`);
        }
    }

    @Get('/logout')
    public async logout(@Req() request: Request, @Res() response: Response): Promise<void> {
        try {
            const { logouUrl } = await this._saml2.logout();

            logger.info(`Successfully processed logout`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:logout',
                controller_action: 'logout',
                result: 'success',
                ...httpCommonFields(request)
            });

            response.redirect(logouUrl);
        } catch (error) {
            logger.error(`Failed to process logout`, {
                area: 'http/web',
                subarea: 'controller/saml2',
                action: 'user:logout',
                controller_action: 'logout',
                result: 'failed',
                error,
                ...httpCommonFields(request)
            });
            throw new InternalServerError(`Couldn't logout ${error.message} ${error.stack}`);
        }
    }

    @Get('/cookie')
    public cookie(@QueryParam('cookie') cookie: string, @Res() response: Response): string {
        response.cookie('connect.cid', cookie);

        return 'cookie :)';
    }
}
