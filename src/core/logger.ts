import { HttpCollectorTransport } from '../core/http_collector_transport';
import { hostname } from 'node:os';
import { createLogger, Logger as WinstonLogger, transports, format } from 'winston';
import { config } from '../config';

const fieldsToMask = [
    'data.body.secret',
    'data.body.password',
    'data.body.token',
    'data.headers.authorization'
];

/**
 * Logging class
 */
class Logger {
    private readonly _logger: WinstonLogger;

    /**
     * Initialize the logger
     * @param logFilePath Path of the log file
     */
    constructor(logFilePath: string) {
        this._logger = createLogger({
            format: format.combine(
                format.simple(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
            ),
            transports: [
                new transports.Console(),
                new transports.File({
                    filename: logFilePath
                })
            ]
        });

        // eslint-disable-next-line no-constant-condition
        if (false && config.env.instanceId) {
            this._logger.add(new HttpCollectorTransport({
                host: config.app.logging.httpHost,
                port: config.app.logging.httpPort,
                token: config.app.logging.httpToken,
                level: 'debug'
            }));
        }

        if (!config.env.production && config.env.environment !== 'test') {
            this._logger.add(new transports.Console({
                format: format.combine(format.simple(), format.timestamp()),
                level: 'debug'
            }));
        } else {
            this._logger.add(new transports.Console({
                format: format.combine(format.simple(), format.timestamp()),
                level: 'info'
            }));
        }
    }

    /**
     * Log an event of type debug
     * @param message
     * @param extended? Extended information related to this entry
     */
    public debug(message: string, extended?: any) {
        this._log(message, 'debug', extended);
    }

    /**
     * Log an event of type error
     * @param message
     * @param extended? Extended information related to this entry
     */
    public error(message: string, extended?: any) {
        this._log(message, 'error', extended);
    }

    /**
     * Log an event of type info
     * @param message
     * @param extended? Extended information related to this entry
     */
    public info(message: string, extended?: any) {
        this._log(message, 'info', extended);
    }

    /**
     * Log an event of type warning
     * @param message
     * @param extended? Extended information related to this entry
     */
    public warn(message: string, extended?: any) {
        this._log(message, 'warn', extended);
    }

    /* PRIVATE */
    /**
     * Write log message to file and console.
     * @param message The log entry message
     * @param level Log level of the entry
     * @param extended Extended information related to this entry
     * @private
     */
    private _log(message: string, level: string, extended: any): void {
        if (extended) {
            extended = {
                ...extended,
                error_message: extended.error?.message,
                error_stack: extended.error?.stack,
                error_validation: Array.isArray(extended.error?.errors)
                    ? Object.fromEntries(extended.error.errors.map((error, index) =>
                        [index, this._processValidationError(error)]))
                    : undefined
            };
        }

        this._logger[level](message, {
            ...this._maskFields(extended),
            app: config.app.name,
            app_instance: hostname(),
            app_version: config.env.version
        });
    }

    /**
     * Mask sensitive fields in the log entry
     * @param extended The log entry
     * @private
     */
    private _maskFields(extended: any): any {
        if (!extended) {
            return extended;
        }

        extended = structuredClone(extended);

        for (const field of fieldsToMask) {
            const path = field.split('.');
            let obj = extended;
            for (let i = 0; i < path.length; i++) {
                if (!obj[path[i]]) {
                    break;
                }

                if (i === path.length - 1) {
                    obj[path[i]] = '***';
                } else {
                    obj = obj[path[i]];
                }
            }
        }

        return extended;
    }

    private _processValidationError(error: any): any {
        return {
            ...error,
            value: error.value === undefined
                ? 'undefined'
                : error.value === null
                    ? 'null'
                    : error.value
        };
    }
}

export const logger = new Logger('log/admin-api.log');
