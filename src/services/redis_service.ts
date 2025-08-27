import { Inject, Service } from 'typedi';
import { createClient } from 'redis';
import { RedisClientType } from '@redis/client';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { FastStoreInterface } from '@pictaccio/admin-api/core/fast_store_interface';
import { logger } from '@pictaccio/admin-api/core/logger';

@Service('fast-store')
export class RedisService implements FastStoreInterface {
    //@Inject('config')
    //private _config: ConfigInterface;

    private _client: RedisClientType;
    private readonly _readyPromise: Promise<void>;

    constructor(
        @Inject('config') private _config: ConfigSchema) {

        // @ts-ignore
        this._client = createClient({
            socket: {
                host: this._config.redis.host,
                port: this._config.redis.port
            }
        });

        this._client.on('error', (error) => {
            logger.error(`Redis error: ${error}`, {
                area: 'services',
                subarea: 'redis',
                action: 'logging',
                error
            });
        });

        logger.info(`Connecting to redis`, {
            area: 'services',
            subarea: 'redis',
            action: 'connecting'
        });
        this._readyPromise = new Promise<void>((resolve, reject) => {
            this._client.on('ready', (error) => {
                if (error) {
                    logger.error(`Failled to connect to redis`, {
                        area: 'services',
                        subarea: 'redis',
                        action: 'connecting',
                        result: 'failed',
                        error
                    });
                    reject(error);
                }

                resolve();
            });
            logger.info(`Connected to redis`, {
                area: 'services',
                subarea: 'redis',
                action: 'connecting',
                result: 'success'
            });
        });

        if (this._config.env.environment !== 'test') {
            this._client.connect();
        }
    }

    public async del(key: string | string[]): Promise<void> {
        await this._client.del(key);
    }

    public async expire(key: string, seconds: number): Promise<void> {
        await this._client.expire(key, seconds);
    }

    public async get(key: string): Promise<string> {
        return await this._client.get(key);
    }

    public async mget(keys: string[]): Promise<string[]> {
        return await this._client.mGet(keys);
    }

    public async publish(topic: string, value?: string): Promise<void> {
        const subscriber = this._client.duplicate();

        subscriber.on('error', (error) => {
            throw error;
        });

        await subscriber.connect();
        await subscriber.publish(topic, value);
    }

    public async ready(): Promise<void> {
        await this._readyPromise;
    }

    public async scan(pattern?: string): Promise<any> {
        return await this._client.scan(0, {
            MATCH: pattern
        });
    }

    public scanIterator(pattern?: string): AsyncIterable<string> {
        return this._client.scanIterator({
            MATCH: pattern
        });
    }

    public async set(key: string, value: string, expire?: number): Promise<void> {
        await this._client.set(key, value, {
            EX: expire
        });
    }

    public async subscribe(topic: string, callback: (value: string) => void): Promise<void> {
        await this._client.executeIsolated(isolatedClient => isolatedClient.subscribe(topic, callback));
    }
}
