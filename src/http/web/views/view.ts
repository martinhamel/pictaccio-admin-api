import { Action, ActionMetadata, BaseView } from '@loufa/routing-controllers';
import { ConfigSchema } from '../../../core/config_schema';
import { Container } from 'typedi';
import { getFixedT } from '../../../loaders/i18next';

type ScriptItem = {
    name: string, // File name of the script in the app's scripts folder
    async: boolean,
    defer: boolean
}

export const SLOT_T = 0;
export const SLOT_URL = 1;

export class View extends BaseView {
    private _config: ConfigSchema;
    private _layout: string;
    private _title: string;
    private _scripts: ScriptItem[] = [];

    constructor(controller: any) {
        super(controller);
        this._config = Container.get<ConfigSchema>('config');
    }

    /**
     * Add a script to the list of scripts that will be included in the header of the layout
     * @param name The name of the script in relation to the app's scripts folder
     * @param async Whether the script should be async
     * @param defer Whether the script should be defered
     */
    public addScripts(name: string, async: boolean, defer: boolean): void {
        this._scripts.push({
            name,
            async,
            defer
        });
    }

    /**
     * Set what layout should be used to render this controller action
     * @param layout The name of the layout
     */
    public setLayout(layout: string): void {
        this._layout = layout;
    }

    /**
     * Set the page's title
     * @param title The title of the page
     */
    public setTitle(title: string): void {
        this._title = title;
    }

    /**
     * Called by routing-controller, don't call
     * @param actionMetadata
     * @param action
     * @param params
     */
    public async executeAction(actionMetadata: ActionMetadata, action: Action, params: any[]): Promise<any> {
        const results = await actionMetadata.callMethod(params, action);
        const viewVars = {
            __internals__: [
                await getFixedT(action.request.session.lang || this._config.locales.fallbacks.lang),
                {
                    hostname: action.request.headers['host'],
                    url: action.request.originalUrl,
                    path: action.request.path
                }
            ],
            __head_title__: this._title,
            __head_scripts__: this._scripts,

            ...results
        };

        if (this._layout !== undefined) {
            viewVars.layout = this._layout;
        }

        this._reset();

        return viewVars;
    }

    /* PRIVATE */
    _reset() {
        this._title = undefined;
        this._layout = undefined;
        this._scripts = [];
    }
}
