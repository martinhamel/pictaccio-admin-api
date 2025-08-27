export interface FastStoreInterface {
    del(key: string|string[]): Promise<void>;
    expire(key: string, seconds: number): Promise<void>;
    get(key: string): Promise<string>;
    mget(keys: string[]): Promise<string[]>;
    publish(topic: string, value?: string): Promise<void>;
    ready(): Promise<void>;
    scan(pattern?: string): Promise<any>;
    scanIterator(pattern?: string): AsyncIterable<string>;
    set(key: string, value: string, expire?: number): Promise<void>;
    subscribe(topic: string, callback: (value: string) => void): Promise<void>;
}
