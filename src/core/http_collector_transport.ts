import { config } from '@pictaccio/admin-api/config';
import { Agent, request } from 'http';
import { isObject, mergeObjects } from '@loufa/loufairy';
import TransportStream, { TransportStreamOptions } from 'winston-transport';

const bufferSize = 10;
const bufferFlushInterval = 2000;
// const httpCollectorEndpointPath = `/${config.env.instanceId}`;

interface HttpCollectorTransportOptions extends TransportStreamOptions {
    host: string;
    port: number;
    token: string;
}

export class HttpCollectorTransport extends TransportStream {
    private readonly _agent: Agent;
    private readonly _auth: string;
    private _options: HttpCollectorTransportOptions;

    /**
     * Create a HttpCollectorTransport with options
     * @param options A TransportStreamOptions objects with the addition of {
     *     host: string;
     *     port: number;
     *     token: string
     * }
     */
    constructor(options: HttpCollectorTransportOptions) {
        super(options);
        this._options = options;

        this._agent = new Agent({ keepAlive: true });
        // this._auth = `Splunk ${options.token}`;
    }

    /**
     * Called when winston has something to log
     * @param info Information about the event
     * @param callback A callback that must be called when the logging operation is finished on our side
     */
    public log(info, callback): void {
        try {
            const httpCollectorRequest = request({
                method: 'POST',
                host: this._options.host,
                port: this._options.port,
                // path: httpCollectorEndpointPath,
                headers: {
                    'Content-Type': 'application/json'
                    // Authorization: this._auth
                },
                agent: this._agent
            });

            httpCollectorRequest.end(Buffer.from(JSON.stringify({
                ...info,
                index: config.env.instanceId
            }), 'utf8'));
        } catch (error) {
            console.log('Couln\'t post to http collector');
            //TODO:  Implement some sort of warning
        }

        if (callback) {
            setImmediate(callback);
        }
    }

    /* PRIVATE */
    /**
     * Normalize a single value from an object to send to splunk. Current implementation only looks at Error type
     * and ensure all properties are logged.
     * @param value The value to normalize
     * @return The normalized value
     * @private
     */
    private _normalizeHttpCollectorValue(value: any): any {
        if (value instanceof Error) {
            return Object.fromEntries([
                ['stack', value.stack],
                ['message', value.message],
                ...Object.entries(value)
            ]);
        } else if (isObject(value)) {
            return this._normalizeHttpCollectorObject(value);
        }

        return value;
    }

    /**
     * Recursively normalize an object before sending to http collector
     * @param httpCollectorObject
     * @return The normalized object
     * @private
     */
    private _normalizeHttpCollectorObject(httpCollectorObject: any): any {
        return Object.fromEntries(Object.entries(httpCollectorObject)
            .map(([prop, value]) => [
                prop,
                this._normalizeHttpCollectorValue(value)
            ])
        );
    }
}
