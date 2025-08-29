import { Authorized, Res, JsonController, Get } from '@loufa/routing-controllers';
import { Response } from 'express';
import { Inject, Service } from 'typedi';
import { ConfigSchema } from '../../../core/config_schema';
import { ConfigResponse } from '../../../http/shared/controllers/responses/config_response';

@Service()
@JsonController()
export class ConfigController {
    constructor(@Inject('config') private _config: ConfigSchema) {
    }

    @Get('/data/config.json')
    public config(): ConfigResponse {
        return {
            status: 'great-success',
            config: {
                app: {
                    locale: this._config.app.locale,
                    password: this._config.app.password,
                    availableRoles: this._config.roles.list
                }
            }
        };
    }

    @Authorized()
    @Get('/data/version')
    public version(@Res() response: Response) {
        return response.status(200).send(this._config.env.version);
    }
}
